import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap, mergeMap, filter, first } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { Campaign, Flight } from '../../campaign/store/reducers';
import { selectCampaignDoc, selectFlightDocById } from '../../campaign/store/selectors';

@Injectable()
export class CampaignService {
  constructor(private augury: AuguryService, private store: Store<any>) {}

  get campaignDoc$(): Observable<HalDoc> {
    return this.store.pipe(
      select(selectCampaignDoc),
      filter(doc => !!doc),
      first()
    );
  }

  getFlightDocById(id): Observable<HalDoc> {
    return this.store.pipe(
      select(selectFlightDocById, { id }),
      filter(doc => !!doc),
      first()
    );
  }

  loadCampaignZoomFlights(id: number): Observable<{ campaignDoc: HalDoc; flightDocs: HalDoc[] }> {
    return this.augury.follow('prx:campaign', { id, zoom: 'prx:flights' }).pipe(
      switchMap(campaignDoc => campaignDoc.follow('prx:flights').pipe(map(flightDocs => ({ campaignDoc, flightDocs })))),
      switchMap(({ campaignDoc, flightDocs }: { campaignDoc: HalDoc; flightDocs: HalDoc }) => {
        // if total is greater than count, request all flights
        let params: any;
        if (+flightDocs['total'] > +flightDocs['count']) {
          params = { per: +flightDocs['total'] };
        }
        return campaignDoc.followItems('prx:flights', params).pipe(map(docs => ({ campaignDoc, flightDocs: docs })));
      })
    );
  }

  updateCampaign(campaign: Campaign): Observable<HalDoc> {
    return this.campaignDoc$.pipe(switchMap(doc => doc.update(campaign)));
  }

  createCampaign(campaign: Campaign): Observable<HalDoc> {
    return this.augury.root.pipe(switchMap(rootDoc => rootDoc.create('prx:campaign', {}, campaign)));
  }

  createFlight(flight: Flight): Observable<HalDoc> {
    return this.campaignDoc$.pipe(switchMap(doc => doc.create('prx:flights', {}, flight)));
  }

  updateFlight(flight: Flight): Observable<HalDoc> {
    return this.getFlightDocById(flight.id).pipe(mergeMap((doc: HalDoc) => doc.update(flight)));
  }

  deleteFlight(flightId): Observable<HalDoc> {
    return this.getFlightDocById(flightId).pipe(mergeMap((doc: HalDoc) => doc.destroy()));
  }
}
