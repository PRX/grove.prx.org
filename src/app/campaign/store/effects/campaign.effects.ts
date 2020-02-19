import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
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
        map(({ campaign, flights }) => new actions.CampaignLoadSuccess({ campaign })),
        catchError(err => of(new actions.CampaignLoadFailure(err)))
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
        map((campaign: Campaign) => new actions.CampaignFormSaveSuccess({ campaign })),
        catchError(err => of(new actions.CampaignFormSaveFailure(err)))
      );
    })
  );

  constructor(private actions$: Actions, private campaignService: CampaignService) {}
}
