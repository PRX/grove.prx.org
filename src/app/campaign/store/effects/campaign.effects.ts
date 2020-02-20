import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import * as actions from '../actions';
import { CampaignActionTypes } from '../actions/campaign.action.types';
import { Campaign } from '../reducers';
import { CampaignService } from '../../../core';

@Injectable()
export class CampaignEffects {
  @Effect()
  campaignLoad$ = this.actions$.pipe(
    ofType(CampaignActionTypes.CAMPAIGN_LOAD),
    map((action: actions.CampaignLoad) => action.payload),
    mergeMap(payload =>
      this.campaignService.loadCampaignZoomFlights(payload.id).pipe(
        map(({ campaign, doc, flights }) => new actions.CampaignLoadSuccess({ campaign, doc })),
        catchError(error => of(new actions.CampaignLoadFailure({ error })))
      )
    )
  );

  @Effect()
  campaignFormSave$ = this.actions$.pipe(
    ofType(CampaignActionTypes.CAMPAIGN_FORM_SAVE),
    map((action: actions.CampaignFormSave) => action.payload),
    mergeMap((payload: { campaign }) => {
      const result = payload.campaign.id
        ? this.campaignService.updateCampaign(payload.campaign)
        : this.campaignService.createCampaign(payload.campaign);
      return result.pipe(
        tap(({ campaign, doc }) => {
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
          if (payload.campaign.id !== campaign.id) {
            // campaign id changed (campaign created)
            this.router.navigate(['/campaign', campaign.id]);
          }
        }),
        map(({ campaign, doc }: { campaign: Campaign; doc: HalDoc }) => new actions.CampaignFormSaveSuccess({ campaign, doc })),
        catchError(error => of(new actions.CampaignFormSaveFailure({ error })))
      );
    })
  );

  constructor(private actions$: Actions, private campaignService: CampaignService, private router: Router) {}
}
