import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, withLatestFrom, share, mergeMap } from 'rxjs/operators';
import { AuguryService } from '../../core/augury.service';
import { CampaignModel } from '../../shared/model/campaign.model';

@Injectable()
export class CampaignService {
  // tslint:disable-next-line: variable-name
  private _campaigns: BehaviorSubject<CampaignModel[]> = new BehaviorSubject([]);
  per = 10;
  page: number;
  total = 0;
  error: Error;

  constructor(private augury: AuguryService) {
    this.loadCampaigns();
  }

  get campaigns(): Observable<CampaignModel[]> {
    return this._campaigns.asObservable();
  }

  loadCampaigns(params?: {page: number}) {
    this.page = params && params.page ? params.page : 1;
    this.augury.followItems('prx:campaigns', {page: this.page, per: this.per}).pipe(
      withLatestFrom(this.augury.root)
    ).subscribe(([campaigns, root]) => {
      this.total = campaigns.length ? campaigns[0]['_total'] : 0;
      this._campaigns.next(campaigns.map(s => new CampaignModel(root, s, true)));
    },
    err => this.error = err);
  }

  findCampaignById(id: number): Observable<CampaignModel> {
    return this._campaigns.pipe(
      map((campaigns) => {
        return campaigns.find(a => a.id === id);
      }),
      withLatestFrom(this.augury.root),
      mergeMap(([campaign, rootDoc]) => {
        // check !NaN, else return empty campaign
        if (!isNaN(id)) {
          // if not found in state, make request
          if (!campaign) {
            return this.augury.follow('prx:campaign', {id}).pipe(
              map(doc => {
                return new CampaignModel(rootDoc, doc, false);
              })
            );
          } else {
            return of(campaign);
          }
        } else {
          return of(new CampaignModel(rootDoc, null, false));
        }
      })
    );
  }

  save(campaign: CampaignModel): Observable<boolean> {
    const saveAction = campaign.save().pipe(share());

    saveAction.pipe(
      withLatestFrom(this.campaigns),
    ).subscribe(([saveStatus, campaigns]) => {
      // any errors are thrown to the ErrorService and raised to the whole app, so ok to ignore here
      const index = campaigns.findIndex((c: CampaignModel) => c.id === campaign.id);
      if (index > -1) {
        this._campaigns.next([
          ...campaigns.slice(0, index),
          campaign,
          ...campaigns.slice(index + 1)
        ]);
      } else {
        this._campaigns.next([...campaigns, campaign]);
      }
    });

    return saveAction;
  }
}
