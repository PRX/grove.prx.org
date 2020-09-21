import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, forkJoin, Observable } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { HalDoc, ToastrService } from 'ngx-prx-styleguide';
import * as campaignActions from '../actions/campaign-action.creator';
import { CampaignFormSave } from '../models';
import { CampaignService } from '../../../core';
import { DashboardService } from '../../../dashboard/dashboard.service';

@Injectable()
export class CampaignEffects {
  campaignLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(campaignActions.CampaignLoad),
      mergeMap(action => this.campaignService.loadCampaignZoomFlightsAndFlightDays(action.id)),
      map(({ campaignDoc, flightDocs, flightDaysDocs }) =>
        campaignActions.CampaignLoadSuccess({ campaignDoc, flightDocs, flightDaysDocs })
      ),
      catchError(error => of(campaignActions.CampaignLoadFailure({ error })))
    )
  );

  campaignFormSave$ = createEffect(() => {
    let newCampaignId;
    return this.actions$.pipe(
      ofType(campaignActions.CampaignSave),
      mergeMap((action: CampaignFormSave) => {
        let campaignSaveResult: Observable<HalDoc>;
        if (action.campaign.id) {
          campaignSaveResult = this.campaignService.updateCampaign(action.campaignDoc, action.campaign);
        } else {
          campaignSaveResult = this.campaignService.createCampaign(action.campaign);
        }
        return campaignSaveResult.pipe(
          // deleted flights
          mergeMap((campaignDoc: HalDoc) => {
            const deletedFlights: { [id: number]: Observable<HalDoc> } = action.deletedFlights.reduce(
              (acc, flight) => ({ ...acc, [flight.id]: this.campaignService.deleteFlight(flight.id) }),
              {}
            );
            return action.deletedFlights.length
              ? forkJoin(deletedFlights).pipe(map(deletedFlightDocs => ({ campaignDoc, deletedFlightDocs })))
              : of({ campaignDoc });
          }),
          // updated flights
          mergeMap(({ campaignDoc, deletedFlightDocs }: { campaignDoc: HalDoc; deletedFlightDocs: { [id: number]: HalDoc } }) => {
            const updatedFlights: { [id: number]: Observable<HalDoc> } = action.updatedFlights.reduce(
              (acc, flight) => ({ ...acc, [flight.id]: this.campaignService.updateFlight(flight) }),
              {}
            );
            return action.updatedFlights.length
              ? forkJoin(updatedFlights).pipe(map(updatedFlightDocs => ({ campaignDoc, deletedFlightDocs, updatedFlightDocs })))
              : of({ campaignDoc, deletedFlightDocs });
          }),
          // created flights
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
              // save off new campaign id in case campaign create succeeded but flight creation fails
              if (!action.campaign.id || action.campaign.id !== campaignDoc.id) {
                newCampaignId = campaignDoc.id;
              }
              const createdFlights: { [id: number]: Observable<HalDoc> } = action.createdFlights.reduce(
                (acc, flight) => ({ ...acc, [flight.id]: this.campaignService.createFlight(campaignDoc, flight) }),
                {}
              );
              return action.createdFlights.length
                ? forkJoin(createdFlights).pipe(
                    map(createdFlightDocs => ({ campaignDoc, updatedFlightDocs, createdFlightDocs, deletedFlightDocs }))
                  )
                : of({ campaignDoc, updatedFlightDocs, deletedFlightDocs });
            }
          ),
          // retrieve the flights' days from each created flight response
          mergeMap(
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
              const flightDaysDocs: Observable<{ [id: number]: HalDoc[] }> = createdFlightDocs
                ? forkJoin(
                    Object.values(createdFlightDocs).reduce(
                      (acc, doc) => ({ ...acc, [doc.id]: this.campaignService.loadFlightDays(doc) }),
                      {}
                    )
                  )
                : of({});
              return flightDaysDocs.pipe(
                map(createdFlightDaysDocs => ({
                  campaignDoc,
                  deletedFlightDocs,
                  updatedFlightDocs,
                  createdFlightDocs,
                  createdFlightDaysDocs
                }))
              );
            }
          ),
          // retrieve the flights' days from each updated flight response
          mergeMap(
            ({
              campaignDoc,
              deletedFlightDocs,
              updatedFlightDocs,
              createdFlightDocs,
              createdFlightDaysDocs
            }: {
              campaignDoc: HalDoc;
              deletedFlightDocs: { [id: number]: HalDoc };
              updatedFlightDocs: { [id: number]: HalDoc };
              createdFlightDocs: { [id: number]: HalDoc };
              createdFlightDaysDocs: { [id: number]: HalDoc[] };
            }) => {
              const flightDaysDocs: Observable<{ [id: number]: HalDoc[] }> = updatedFlightDocs
                ? forkJoin(
                    Object.values(updatedFlightDocs).reduce(
                      (acc, doc) => ({ ...acc, [doc.id]: this.campaignService.loadFlightDays(doc) }),
                      {}
                    )
                  )
                : of({});
              return flightDaysDocs.pipe(
                map(updatedFlightDaysDocs => ({
                  campaignDoc,
                  deletedFlightDocs,
                  updatedFlightDocs,
                  updatedFlightDaysDocs,
                  createdFlightDocs,
                  createdFlightDaysDocs
                }))
              );
            }
          ),
          tap(
            ({
              campaignDoc,
              deletedFlightDocs,
              createdFlightDocs
            }: {
              campaignDoc: HalDoc;
              deletedFlightDocs: { [id: number]: HalDoc };
              createdFlightDocs: { [id: number]: HalDoc };
            }) => {
              this.toastr.success('Campaign saved');
              // navigate to newly created campaign/flight or away from deleted flight
              const campaignId = campaignDoc.id;
              const flightId = +this.router.url.split('/flight/').pop();
              if (this.router.url.includes('/flight/') && deletedFlightDocs && deletedFlightDocs[flightId]) {
                // routed flight deleted
                this.router.navigate(['/campaign', campaignId]);
              } else if (this.router.url.includes('/flight/') && createdFlightDocs && createdFlightDocs[flightId]) {
                // flight id changed (flight created)
                this.router.navigate(['/campaign', campaignId, 'flight', createdFlightDocs[flightId].id]);
              } else if (!action.campaign.id || action.campaign.id !== campaignId) {
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
              updatedFlightDaysDocs,
              createdFlightDocs,
              createdFlightDaysDocs
            }: {
              campaignDoc: HalDoc;
              deletedFlightDocs: { [id: number]: HalDoc };
              updatedFlightDocs: { [id: number]: HalDoc };
              updatedFlightDaysDocs: { [id: number]: HalDoc[] };
              createdFlightDocs: { [id: number]: HalDoc };
              createdFlightDaysDocs: { [id: number]: HalDoc[] };
            }) =>
              campaignActions.CampaignSaveSuccess({
                campaignDoc,
                deletedFlightDocs,
                updatedFlightDocs,
                updatedFlightDaysDocs,
                createdFlightDocs,
                createdFlightDaysDocs
              })
          ),
          catchError(error => {
            // if there's a new campaign id, navigate to it
            if (newCampaignId) {
              this.router.navigate(['/campaign', newCampaignId]);
            }
            return of(campaignActions.CampaignSaveFailure({ error }));
          })
        );
      })
    );
  });

  addFlight$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(campaignActions.CampaignAddFlight),
        map(action => {
          this.router.navigate(['/campaign', action.campaignId, 'flight', action.flightId]);
        })
      ),
    { dispatch: false }
  );

  dupFlight$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(campaignActions.CampaignDupFlight),
        map(action => {
          const { campaignId, flightId } = action;
          this.router.navigate(['/campaign', campaignId, 'flight', flightId]);
        })
      ),
    { dispatch: false }
  );

  dupCampaignById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(campaignActions.CampaignDupById),
      mergeMap(action =>
        this.campaignService
          .loadCampaignZoomFlights(action.id)
          .pipe(map(({ campaignDoc, flightDocs }) => ({ action, campaignDoc, flightDocs })))
      ),
      map(({ action, campaignDoc, flightDocs }) =>
        campaignActions.CampaignDupByIdSuccess({ campaignDoc, flightDocs, timestamp: action.timestamp })
      ),
      tap(() => this.toastr.success('Campaign duplicated')),
      catchError(error => of(campaignActions.CampaignDupByIdFailure({ error })))
    )
  );

  duplicateCampaign$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(campaignActions.CampaignDuplicate),
        tap(action => {
          const { campaign, flights } = action;
          const state = {
            campaign,
            flights: flights.map(flight => ({
              ...flight,
              // TWO THINGS:
              // * Clear all flight dates on duplication
              // * Moments cannot be serialized into state on the router, so the dates error unless translated to a string type or whatever
              startAt: undefined,
              endAt: undefined,
              endAtFudged: undefined,
              contractStartAt: undefined,
              contractEndAt: undefined,
              contractEndAtFudged: undefined
            }))
          };
          this.router.navigate(['/campaign', 'new'], { state });
        })
      ),
    { dispatch: false }
  );

  dupCampaignFromForm$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(campaignActions.CampaignDupFromForm),
        tap(() => this.toastr.success('Campaign duplicated'))
      ),
    { dispatch: false }
  );

  deleteCampaign$ = createEffect(() =>
    this.actions$.pipe(
      ofType(campaignActions.CampaignDelete),
      mergeMap(action => this.campaignService.deleteCampaign(action.doc)),
      map(({ id }: HalDoc) => campaignActions.CampaignDeleteSuccess({ id })),
      tap(() => {
        this.toastr.success('Campaign deleted.');
        this.router.navigate(['/campaigns'], { queryParams: this.dashboardService.getRouteQueryParams({}) });
      }),
      catchError(error => of(campaignActions.CampaignDeleteFailure({ error })))
    )
  );

  constructor(
    private actions$: Actions<campaignActions.CampaignActions>,
    private campaignService: CampaignService,
    private router: Router,
    private toastr: ToastrService,
    private dashboardService: DashboardService
  ) {}
}
