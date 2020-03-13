import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of, forkJoin, Observable } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { HalDoc, ToastrService } from 'ngx-prx-styleguide';
import * as actions from '../actions';
import { ActionTypes } from '../actions/action.types';
import { CampaignFormSave } from '../reducers';
import { CampaignService } from '../../../core';

@Injectable()
export class CampaignEffects {
  @Effect()
  campaignLoad$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_LOAD),
    map((action: actions.CampaignLoad) => action.payload),
    mergeMap(payload =>
      this.campaignService.loadCampaignZoomFlights(payload.id).pipe(
        map(({ campaignDoc, flightDocs }) => new actions.CampaignLoadSuccess({ campaignDoc, flightDocs })),
        catchError(error => of(new actions.CampaignLoadFailure({ error })))
      )
    )
  );

  @Effect()
  campaignFormSave$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_SAVE),
    map((action: actions.CampaignSave) => action.payload),
    mergeMap((payload: CampaignFormSave) => {
      let campaignSaveResult: Observable<HalDoc>;
      if (payload.campaign.id) {
        campaignSaveResult = this.campaignService.updateCampaign(payload.campaign);
      } else {
        campaignSaveResult = this.campaignService.createCampaign(payload.campaign);
      }
      return campaignSaveResult.pipe(
        mergeMap((campaignDoc: HalDoc) => {
          const deletedFlights: { [id: number]: Observable<HalDoc> } = payload.deletedFlights.reduce(
            (acc, flight) => ({ ...acc, [flight.id]: this.campaignService.deleteFlight(flight.id) }),
            {}
          );
          return payload.deletedFlights.length
            ? forkJoin(deletedFlights).pipe(map(deletedFlightDocs => ({ campaignDoc, deletedFlightDocs })))
            : of({ campaignDoc });
        }),
        mergeMap(({ campaignDoc, deletedFlightDocs }: { campaignDoc: HalDoc; deletedFlightDocs: { [id: number]: HalDoc } }) => {
          const updatedFlights: { [id: number]: Observable<HalDoc> } = payload.updatedFlights.reduce(
            (acc, flight) => ({ ...acc, [flight.id]: this.campaignService.updateFlight(flight) }),
            {}
          );
          return payload.updatedFlights.length
            ? forkJoin(updatedFlights).pipe(map(updatedFlightDocs => ({ campaignDoc, deletedFlightDocs, updatedFlightDocs })))
            : of({ campaignDoc, deletedFlightDocs });
        }),
        mergeMap(
          ({
            campaignDoc,
            updatedFlightDocs,
            deletedFlightDocs
          }: {
            campaignDoc: HalDoc;
            updatedFlightDocs: { [id: number]: HalDoc };
            deletedFlightDocs: { [id: number]: HalDoc };
          }) => {
            const createdFlights: { [id: number]: Observable<HalDoc> } = payload.createdFlights.reduce(
              (acc, flight) => ({ ...acc, [flight.id]: this.campaignService.createFlight(flight) }),
              {}
            );
            return payload.createdFlights.length
              ? forkJoin(createdFlights).pipe(
                  map(createdFlightDocs => ({ campaignDoc, updatedFlightDocs, createdFlightDocs, deletedFlightDocs }))
                )
              : of({ campaignDoc, updatedFlightDocs, deletedFlightDocs });
          }
        ),
        tap(
          ({
            campaignDoc,
            deletedFlightDocs,
            updatedFlightDocs,
            createdFlightDocs
          }: {
            campaignDoc: HalDoc;
            deletedFlightDocs: { [id: number]: HalDoc };
            updatedFlightDocs: { [id: number]: HalDoc };
            createdFlightDocs: { [id: number]: HalDoc };
          }) => {
            this.toastr.success('Campaign saved');
            // navigate to newly created campaign/flight or away from deleted flight
            const campaignId = campaignDoc.id;
            const flightId = +this.router.url.split('/flight/').pop();
            debugger;
            if (this.router.url.includes('/flight/') && deletedFlightDocs && deletedFlightDocs[flightId]) {
              // routed flight deleted
              this.router.navigate(['/campaign', campaignId]);
            } else if (this.router.url.includes('/flight/') && createdFlightDocs && createdFlightDocs[flightId]) {
              // flight id changed (flight created)
              this.router.navigate(['/campaign', campaignId, 'flight', createdFlightDocs[flightId].id]);
            } else if (!payload.campaign.id || payload.campaign.id !== campaignId) {
              // campaign id changed (campaign created)
              this.router.navigate(['/campaign', campaignId]);
            }
          }
        ),
        map(
          ({
            campaignDoc,
            deletedFlightDocs,
            updatedFlightDocs,
            createdFlightDocs
          }: {
            campaignDoc: HalDoc;
            deletedFlightDocs: { [id: number]: HalDoc };
            updatedFlightDocs: { [id: number]: HalDoc };
            createdFlightDocs: { [id: number]: HalDoc };
          }) => new actions.CampaignSaveSuccess({ campaignDoc, deletedFlightDocs, updatedFlightDocs, createdFlightDocs })
        ),
        catchError(error => of(new actions.CampaignSaveFailure({ error })))
      );
    })
  );

  @Effect()
  addFlight$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_ADD_FLIGHT),
    map((action: actions.CampaignAddFlight) => {
      const date = new Date(Date.now());
      const flightId = date.getTime();
      const startAt = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const endAt = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1));
      this.router.navigate(['/campaign', action.payload.campaignId, 'flight', flightId]);
      return new actions.CampaignAddFlightWithTempId({ flightId, startAt, endAt });
    })
  );

  @Effect()
  dupFlight$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_DUP_FLIGHT),
    map((action: actions.CampaignDupFlight) => {
      const { campaignId, flight } = action.payload;
      const flightId = Date.now();
      this.router.navigate(['/campaign', campaignId, 'flight', flightId]);
      return new actions.CampaignDupFlightWithTempId({ flightId, flight });
    })
  );

  constructor(private actions$: Actions, private campaignService: CampaignService, private router: Router, private toastr: ToastrService) {}
}
