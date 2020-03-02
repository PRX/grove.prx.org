import { Action } from '@ngrx/store';
import { ActionTypes as actionTypes } from './action.types';
import { Campaign, Flight } from '../reducers/';
import { HalDoc } from 'ngx-prx-styleguide';

export class CampaignNew implements Action {
  readonly type = actionTypes.CAMPAIGN_NEW;
}

export class CampaignLoad implements Action {
  readonly type = actionTypes.CAMPAIGN_LOAD;

  constructor(public payload: { id: number }) {}
}
export class CampaignLoadSuccess implements Action {
  readonly type = actionTypes.CAMPAIGN_LOAD_SUCCESS;

  constructor(public payload: { campaignDoc: HalDoc; flightDocs: HalDoc[] }) {}
}
export class CampaignLoadFailure implements Action {
  readonly type = actionTypes.CAMPAIGN_LOAD_FAILURE;

  constructor(public payload: { error: any }) {}
}

export class CampaignFormUpdate implements Action {
  readonly type = actionTypes.CAMPAIGN_FORM_UPDATE;

  constructor(public payload: { campaign: Campaign; changed: boolean; valid: boolean }) {}
}

export class CampaignSave implements Action {
  readonly type = actionTypes.CAMPAIGN_SAVE;

  constructor(public payload: { campaign: Campaign }) {}
}
export class CampaignSaveSuccess implements Action {
  readonly type = actionTypes.CAMPAIGN_SAVE_SUCCESS;

  constructor(public payload: { campaignDoc: HalDoc }) {}
}
export class CampaignSaveFailure implements Action {
  readonly type = actionTypes.CAMPAIGN_SAVE_FAILURE;

  constructor(public payload: { error: any }) {}
}

export class CampaignAddFlight implements Action {
  readonly type = actionTypes.CAMPAIGN_ADD_FLIGHT;
}

export class CampaignDupFlight implements Action {
  readonly type = actionTypes.CAMPAIGN_DUP_FLIGHT;

  constructor(public payload: { flight: Flight }) {}
}

export class CampaignDeleteFlight implements Action {
  readonly type = actionTypes.CAMPAIGN_DELETE_FLIGHT;

  constructor(public payload: { id: number; softDeleted: boolean }) {}
}

export class CampaignFlightFormUpdate implements Action {
  readonly type = actionTypes.CAMPAIGN_FLIGHT_FORM_UPDATE;

  constructor(public payload: { id: number; flight: Flight; changed: boolean; valid: boolean }) {}
}

export type CampaignActions =
  | CampaignNew
  | CampaignLoad
  | CampaignLoadSuccess
  | CampaignLoadFailure
  | CampaignFormUpdate
  | CampaignFlightFormUpdate
  | CampaignAddFlight
  | CampaignDupFlight
  | CampaignDeleteFlight
  | CampaignSave
  | CampaignSaveSuccess
  | CampaignSaveFailure;
