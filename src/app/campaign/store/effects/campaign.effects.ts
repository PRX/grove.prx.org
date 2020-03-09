import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import * as actions from '../actions';
import { ActionTypes } from '../actions/action.types';
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
    mergeMap((payload: { campaign }) => {
      const result = payload.campaign.id
        ? this.campaignService.updateCampaign(payload.campaign)
        : this.campaignService.createCampaign(payload.campaign);
      return result.pipe(
        tap(({ campaignDoc }: { campaignDoc: HalDoc }) => {
          // TODO: incorporate flight changes and the rest of routing here
          // navigate to newly created campaign/flight
          // const flightId = this.router.url.split('/flight/').pop();
          // if (this.router.url.includes('/flight/') && !changes.flights[flightId]) {
          //   // flight not in changes (flight deleted)
          //   this.router.navigate(['/campaign', campaign.id]);
          // } else if (this.router.url.includes('/flight/') && flightId !== changes.flights[flightId]) {
          //   // flight id changed (flight created)
          //   this.router.navigate(['/campaign', campaign.id, 'flight', changes.flights[flightId]]);
          // } else
          if (payload.campaign.id !== campaignDoc.id) {
            // campaign id changed (campaign created)
            this.router.navigate(['/campaign', campaignDoc.id]);
          }
        }),
        map(({ campaignDoc }: { campaignDoc: HalDoc }) => new actions.CampaignSaveSuccess({ campaignDoc })),
        catchError(error => of(new actions.CampaignSaveFailure({ error })))
      );
    })
  );

  @Effect()
  addFlight$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_ADD_FLIGHT),
    map((action: actions.CampaignAddFlight) => {
      const date = new Date();
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
      const date = new Date();
      const flightId = date.getTime();
      this.router.navigate(['/campaign', campaignId, 'flight', flightId]);
      return new actions.CampaignDupFlightWithTempId({ flightId, flight });
    })
  );

  constructor(private actions$: Actions, private campaignService: CampaignService, private router: Router) {}
}
