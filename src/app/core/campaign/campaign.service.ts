import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject, forkJoin } from 'rxjs';
import { map, switchMap, catchError, first } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { CampaignState, Campaign, Flight, FlightState } from './campaign-store.service';

@Injectable()
export class CampaignService {
  // tslint:disable-next-line:variable-name
  private _campaignDoc: HalDoc;
  // tslint:disable-next-line:variable-name
  private _flightDocs: { [id: number]: HalDoc };

  constructor(private augury: AuguryService) {}

  getCampaign(id: number | string): Observable<CampaignState> {
    return this.augury.follow('prx:campaign', { id, zoom: 'prx:flights' }).pipe(
      switchMap(doc => doc.followItems('prx:flights').pipe(map(flightDocs => ({ doc, flightDocs })))),
      map(({ doc, flightDocs }) => {
        this._campaignDoc = doc;
        this._flightDocs = flightDocs.reduce((accum, flight) => ({ ...accum, [flight.id]: flight }), {});
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
      return this._campaignDoc.update(state.localCampaign).pipe(
        map(doc => {
          this._campaignDoc = doc;
          return this.docToCampaign(doc);
        })
      );
    } else {
      return this.augury.root.pipe(
        switchMap(rootDoc => rootDoc.create('prx:campaign', {}, state.localCampaign)),
        map(doc => {
          this._campaignDoc = doc;
          return this.docToCampaign(doc);
        })
      );
    }
  }

  putFlight(state: FlightState): Observable<FlightState> {
    if (!state.changed) {
      console.log('putFlight unchanged', state.localFlight.name);
      return of(state);
    } else if (state.remoteFlight) {
      console.log('putFlight exists', state.localFlight.name);
      return this._flightDocs[state.remoteFlight.id].update(state.localFlight).pipe(map(doc => this.docToFlight(doc)));
    } else {
      console.log('putFlight new', state);
      return this._campaignDoc.create('prx:flight', {}, state.localFlight).pipe(map(doc => this.docToFlight(doc)));
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
