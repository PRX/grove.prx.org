import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';

export interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  repName: string;
  notes: string;
  set_account_uri: string;
  set_advertiser_uri: string;
}

@Injectable()
export class CampaignService {
  constructor(private augury: AuguryService) {}

  getCampaign(id: number): Observable<Campaign> {
    if (id) {
      return this.augury.follow('prx:campaign', { id }).pipe(
        map(this.docToCampaign),
        catchError(this.handleError)
      );
    } else {
      return of(null);
    }
  }

  putCampaign(campaign: Campaign): Observable<Campaign> {
    if (campaign.id) {
      return this.augury.follow('prx:campaign', { id: campaign.id }).pipe(
        flatMap(doc => {
          const json = { ...doc.asJSON(), ...campaign };
          return doc.update(json);
        }),
        map(this.docToCampaign)
      );
    } else {
      return this.augury.root.pipe(
        flatMap(rootDoc => {
          return rootDoc.create('prx:campaign', {}, campaign);
        }),
        map(this.docToCampaign)
      );
    }
  }

  docToCampaign(doc: HalDoc): Campaign {
    const campaign = <Campaign>doc.asJSON();
    campaign.set_advertiser_uri = doc.expand('prx:advertiser');
    campaign.set_account_uri = doc.expand('prx:account');
    return campaign;
  }

  handleError(err: any) {
    if (err.status === 404) {
      return of(null);
    } else {
      throw err;
    }
  }
}
