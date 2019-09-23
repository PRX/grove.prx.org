import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { CampaignState, Campaign, Flight, FlightState } from './campaign.models';

@Injectable()
export class CampaignService {
  private campaignDoc: HalDoc;
  private flightDocs: { [id: number]: HalDoc };

  constructor(private augury: AuguryService) {}

  getCampaign(id: number | string): Observable<CampaignState> {
    return this.augury.follow('prx:campaign', { id, zoom: 'prx:flights' }).pipe(
      switchMap(doc => doc.followItems('prx:flights').pipe(map(flightDocs => ({ doc, flightDocs })))),
      map(({ doc, flightDocs }) => {
        this.campaignDoc = doc;
        this.flightDocs = flightDocs.reduce((accum, flight) => ({ ...accum, [flight.id]: flight }), {});
        const campaign = this.docToCampaign(doc);
        const flights = flightDocs.reduce((accum, flight) => ({ ...accum, [flight.id]: this.docToFlight(flight) }), {});
        return { ...campaign, flights };
      }),
      catchError(this.handleError)
    );
  }

  putCampaign(state: CampaignState): Observable<CampaignState> {
    if (!state.changed) {
      return of(state);
    } else if (state.remoteCampaign) {
      return this.campaignDoc.update(state.localCampaign).pipe(
        map(doc => {
          this.campaignDoc = doc;
          return this.docToCampaign(doc);
        })
      );
    } else {
      return this.augury.root.pipe(
        switchMap(rootDoc => rootDoc.create('prx:campaign', {}, state.localCampaign)),
        map(doc => {
          this.campaignDoc = doc;
          return this.docToCampaign(doc);
        })
      );
    }
  }

  putFlight(state: FlightState): Observable<FlightState> {
    if (!state.changed) {
      return of(state);
    } else if (state.remoteFlight) {
      return this.flightDocs[state.remoteFlight.id].update(state.localFlight).pipe(map(doc => this.docToFlight(doc)));
    } else {
      return this.campaignDoc.create('prx:flights', {}, state.localFlight).pipe(map(doc => this.docToFlight(doc)));
    }
  }

  docToCampaign(doc: HalDoc): CampaignState {
    const campaign = this.filter(doc) as Campaign;
    campaign.set_advertiser_uri = doc.expand('prx:advertiser');
    campaign.set_account_uri = doc.expand('prx:account');
    return {
      remoteCampaign: campaign,
      localCampaign: campaign,
      flights: {},
      changed: false,
      valid: true
    };
  }

  docToFlight(doc: HalDoc): FlightState {
    const flight = this.filter(doc) as Flight;
    flight.set_inventory_uri = doc.expand('prx:inventory');
    return {
      remoteFlight: flight,
      localFlight: flight,
      changed: false,
      valid: true
    };
  }

  filter(doc: HalDoc): {} {
    return Object.keys(doc.asJSON())
      .filter(key => !key.startsWith('_'))
      .reduce((obj, key) => ({ ...obj, [key]: doc[key] }), {});
  }

  handleError(err: any) {
    if (err.status === 404) {
      return of(null);
    } else {
      throw err;
    }
  }
}
