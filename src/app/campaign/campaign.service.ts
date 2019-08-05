import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';
import { CampaignModel } from '../shared/model/campaign.model';

@Injectable()
export class CampaignService {
  // tslint:disable-next-line: variable-name
  private _campaigns: BehaviorSubject<CampaignModel[]> = new BehaviorSubject([]);

  constructor(private augury: AuguryService) {
    this.loadCampaigns();
  }

  get root(): Observable<HalDoc> {
    return this.augury.root;
  }

  get campaigns(): Observable<CampaignModel[]> {
    return this._campaigns.asObservable();
  }

  loadCampaigns() {
    this.augury.followItems('prx:campaigns').pipe(withLatestFrom(this.augury.root)).subscribe(([campaigns, root]) => {
      this._campaigns.next(campaigns.map(s => new CampaignModel(root, s, false)));
      console.log(this._campaigns.getValue());
    });
  }

  findCampaignById(id: number): Observable<CampaignModel> {
    return this._campaigns.pipe(
      withLatestFrom(this.augury.root),
      map(([campaigns, rootDoc]) => {
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
