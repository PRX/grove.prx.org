import { Action } from '@ngrx/store';
import { CampaignActionTypes as actionTypes } from './campaign.action.types';
import { Campaign } from '../reducers/';
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

  constructor(public payload: { campaign: Campaign; doc: HalDoc }) {}
}
export class CampaignLoadFailure implements Action {
  readonly type = actionTypes.CAMPAIGN_LOAD_FAILURE;

  constructor(public payload: { error: any }) {}
}

export class CampaignFormUpdate implements Action {
  readonly type = actionTypes.CAMPAIGN_FORM_UPDATE;

  constructor(public payload: { campaign: Campaign; changed: boolean; valid: boolean }) {}
}

export class CampaignFormSave implements Action {
  readonly type = actionTypes.CAMPAIGN_FORM_SAVE;

  constructor(public payload: { campaign: Campaign }) {}
}
export class CampaignFormSaveSuccess implements Action {
  readonly type = actionTypes.CAMPAIGN_FORM_SAVE_SUCCESS;

  constructor(public payload: { campaign: Campaign; doc: HalDoc }) {}
}
export class CampaignFormSaveFailure implements Action {
  readonly type = actionTypes.CAMPAIGN_FORM_SAVE_FAILURE;

  constructor(public payload: { error: any }) {}
}

export type CampaignActions =
  | CampaignNew
  | CampaignLoad
  | CampaignLoadSuccess
  | CampaignLoadFailure
  | CampaignFormUpdate
  | CampaignFormSave
  | CampaignFormSaveSuccess
  | CampaignFormSaveFailure;
