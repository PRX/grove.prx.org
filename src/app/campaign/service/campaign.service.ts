import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { AuguryService } from '../../core/augury.service';
import { CampaignModel } from '../../shared/model/campaign.model';

@Injectable()
export class CampaignService {
  // tslint:disable-next-line: variable-name
  private _campaigns: BehaviorSubject<CampaignModel[]> = new BehaviorSubject([]);
  per = 10;
  page: number;
  total = 0;

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
      this._campaigns.next(campaigns.map(s => new CampaignModel(root, s, false)));
    });
  }

  findCampaignById(id: number): Observable<CampaignModel> {
    return this._campaigns.pipe(
      withLatestFrom(this.augury.root),
      map(([campaigns, rootDoc]) => {
        // TODO: lookup campaign if not found and only then if not found return model with rootDoc and null
        return campaigns.find(c => c.id === id) || new CampaignModel(rootDoc, null, false);
      })
    );
  }

  save(campaign: CampaignModel): Observable<boolean> {
    const saveAction = campaign.save();

    saveAction.pipe(
      withLatestFrom(this.campaigns),
    ).subscribe(([saveStatus, campaigns]) => {
      const index = campaigns.findIndex((c: CampaignModel) => c.id === campaign.id);
      this._campaigns.next([
        ...campaigns.slice(0, index),
        campaign,
        ...campaigns.slice(index + 1)
      ]);
    });

    return saveAction;
  }
}
