import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { CampaignModel } from '../../shared/model/campaign.model';

@Injectable()
export class CampaignServiceMock {
  constructor(private augury: MockHalService) {}

  loadCampaigns() {}

  get campaigns(): Observable<CampaignModel[]> {
    return of([
      new CampaignModel(this.augury.root, new MockHalDoc({
          id: 1,
          name: 'New Campaign',
          status: 'canceled',
          type: 'paid_campaign'
      })),
      new CampaignModel(this.augury.root, new MockHalDoc({
          id: 2,
          name: 'Another Campaign',
          status: 'approved',
          type: 'paid_campaign'
      })),
      new CampaignModel(this.augury.root, new MockHalDoc({
          id: 3,
          name: 'Third Campaign',
          status: 'sold',
          type: 'house'
      }))
    ]);
  }

  findCampaignById(id: number): Observable<CampaignModel> {
    return this.campaigns.pipe(
      map(campaigns => {
        return campaigns.find(c => c.id === id) || new CampaignModel(this.augury.root, null, false);
      })
    );
  }

  save(): Observable<{}> {
    return of();
  }
}
