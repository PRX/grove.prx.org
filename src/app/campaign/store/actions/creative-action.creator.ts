import { createAction, props, union } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { HalDoc } from 'ngx-prx-styleguide';
import { Creative } from '../models';

export const CampaignCreativeNew = createAction(ActionTypes.CAMPAIGN_CREATIVE_NEW);

export const CampaignCreativeLoad = createAction(ActionTypes.CAMPAIGN_CREATIVE_LOAD, props<{ id: number }>());
export const CampaignCreativeLoadSuccess = createAction(ActionTypes.CAMPAIGN_CREATIVE_LOAD_SUCCESS, props<{ creativeDoc: HalDoc }>());
export const CampaignLoadFailure = createAction(ActionTypes.CAMPAIGN_CREATIVE_LOAD_FAILURE, props<{ error }>());

export const CampaignCreativeFormUpdate = createAction(
  ActionTypes.CAMPAIGN_CREATIVE_FORM_UPDATE,
  props<{ creative: Creative; changed: boolean; valid: boolean }>()
);
