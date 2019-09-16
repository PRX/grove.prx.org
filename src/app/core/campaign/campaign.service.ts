import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, switchMap, catchError, first } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { CampaignState, Campaign } from './campaign-store.service';

@Injectable()
export class CampaignService {
  constructor(private augury: AuguryService) {}

  getCampaign(id: number | string): Observable<CampaignState> {
    return this.augury.follow('prx:campaign', { id, zoom: 'prx:flights' }).pipe(
      switchMap(this.docToCampaign),
      catchError(this.handleError)
    );
  }

  putCampaign(state: CampaignState): Observable<CampaignState> {
    if (state.remoteCampaign) {
      return this.augury.follow('prx:campaign', { id: state.remoteCampaign.id }).pipe(
        switchMap(doc => doc.update(state.localCampaign)),
        switchMap(this.docToCampaign)
      );
    } else {
      return this.augury.root.pipe(
        switchMap(rootDoc => rootDoc.create('prx:campaign', {}, state.localCampaign)),
        switchMap(this.docToCampaign)
      );
    }
  }

  docToCampaign(doc: HalDoc): Observable<CampaignState> {
    const campaign = doc.asJSON() as Campaign;
    campaign.set_advertiser_uri = doc.expand('prx:advertiser');
    campaign.set_account_uri = doc.expand('prx:account');
    return doc.followItems('prx:flights').pipe(
      map(flightDocs => {
        const flights = flightDocs.reduce((prev, flight) => {
          prev[flight.id.toString()] = {
            campaignId: campaign.id,
            remoteFlight: flight,
            localFlight: flight,
            changed: false,
            valid: true
          };
          return prev;
        }, {});
        return {
          remoteCampaign: campaign,
          localCampaign: campaign,
          flights,
          changed: false,
          valid: true
        };
      })
    );
  }

  handleError(err: any) {
    if (err.status === 404) {
      return of(null);
    } else {
      throw err;
    }
  }
}
