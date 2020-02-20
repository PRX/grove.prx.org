import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError, find } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { CampaignState, Campaign, Flight, FlightState } from './campaign.models';
import { selectCampaignDoc } from '../../campaign/store/selectors';

@Injectable()
export class CampaignService {
  campaignDoc$: Observable<HalDoc>;
  private flightDocs: { [id: number]: HalDoc } = {};

  constructor(private augury: AuguryService, private store: Store<any>) {
    this.campaignDoc$ = this.store.pipe(
      select(selectCampaignDoc),
      // wait for campaign doc to be defined (on new campaign)
      find(doc => !!doc)
    );
  }

  getCampaign(id: number | string): Observable<CampaignState> {
    return this.augury.follow('prx:campaign', { id, zoom: 'prx:flights' }).pipe(
      switchMap(doc => doc.follow('prx:flights').pipe(map(flights => ({ doc, flights })))),
      switchMap(({ doc, flights }: { doc: HalDoc; flights: HalDoc }) => {
        // if total is greater than count, request all flights
        let params: any;
        if (+flights['total'] > +flights['count']) {
          params = { per: +flights['total'] };
        }
        return doc.followItems('prx:flights', params).pipe(map(flightDocs => ({ doc, flightDocs })));
      }),
      map(({ doc, flightDocs }) => {
        this.flightDocs = flightDocs.reduce((accum, flight) => ({ ...accum, [flight.id]: flight }), {});
        const campaign = this.docToCampaignState(doc);
        const flights = flightDocs.reduce((accum, flight) => ({ ...accum, [flight.id]: this.docToFlightState(flight) }), {});
        return { ...campaign, flights };
      }),
      catchError(this.handleError)
    );
  }

  putCampaign(state: CampaignState): Observable<CampaignState> {
    if (!state.changed) {
      return of(state);
    } else if (state.remoteCampaign) {
      return this.campaignDoc$.pipe(
        switchMap(doc => doc.update(state.localCampaign)),
        map(doc => this.docToCampaignState(doc))
      );
    } else {
      return this.augury.root.pipe(
        switchMap(rootDoc => rootDoc.create('prx:campaign', {}, state.localCampaign)),
        map(doc => {
          return this.docToCampaignState(doc);
        })
      );
    }
  }

  loadCampaignZoomFlights(id: number): Observable<{ campaign: Campaign; doc: HalDoc; flights: Flight[] }> {
    return this.augury.follow('prx:campaign', { id, zoom: 'prx:flights' }).pipe(
      switchMap(doc => doc.follow('prx:flights').pipe(map(flights => ({ doc, flights })))),
      switchMap(({ doc, flights }: { doc: HalDoc; flights: HalDoc }) => {
        // if total is greater than count, request all flights
        let params: any;
        if (+flights['total'] > +flights['count']) {
          params = { per: +flights['total'] };
        }
        return doc.followItems('prx:flights', params).pipe(map(flightDocs => ({ doc, flightDocs })));
      }),
      map(({ doc, flightDocs }) => {
        const campaign = this.docToCampaign(doc);
        const flights = flightDocs.map(flight => this.docToFlight(flight));
        return { campaign, doc, flights };
      }),
      catchError(this.handleError)
    );
  }

  updateCampaign(campaign: Campaign): Observable<{ campaign: Campaign; doc: HalDoc }> {
    return this.campaignDoc$.pipe(
      switchMap(doc => doc.update(campaign)),
      map(updatedDoc => ({ campaign: this.docToCampaign(updatedDoc), doc: updatedDoc }))
    );
  }

  createCampaign(campaign: Campaign): Observable<{ campaign: Campaign; doc: HalDoc }> {
    return this.augury.root.pipe(
      switchMap(rootDoc => rootDoc.create('prx:campaign', {}, campaign)),
      map(doc => ({ campaign: this.docToCampaign(doc), doc }))
    );
  }

  putFlight(state: FlightState): Observable<FlightState> {
    if (!state.changed) {
      return of(state);
    } else if (state.remoteFlight) {
      return this.flightDocs[state.remoteFlight.id].update(state.localFlight).pipe(
        map(doc => {
          this.flightDocs[doc.id] = doc;
          return this.docToFlightState(doc);
        })
      );
    } else {
      return this.campaignDoc$.pipe(
        switchMap(doc => doc.create('prx:flights', {}, state.localFlight)),
        map(doc => {
          this.flightDocs[doc.id] = doc;
          return this.docToFlightState(doc);
        })
      );
    }
  }

  deleteFlight(flightId): Observable<HalDoc> {
    return this.flightDocs[flightId].destroy();
  }

  docToCampaign(doc: HalDoc): Campaign {
    const campaign = this.filter(doc) as Campaign;
    campaign.set_advertiser_uri = doc.expand('prx:advertiser');
    campaign.set_account_uri = doc.expand('prx:account');
    return campaign;
  }

  docToFlight(doc: HalDoc): Flight {
    const flight = this.filter(doc) as Flight;
    flight.set_inventory_uri = doc.expand('prx:inventory');
    return flight;
  }

  docToCampaignState(doc: HalDoc): CampaignState {
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

  docToFlightState(doc: HalDoc): FlightState {
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
