import { createAction, props, union } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { HalDoc } from 'ngx-prx-styleguide';

export const AdvertisersLoad = createAction(ActionTypes.CAMPAIGN_ADVERTISERS_LOAD);
export const AdvertisersLoadSuccess = createAction(ActionTypes.CAMPAIGN_ADVERTISERS_LOAD_SUCCESS, props<{ docs: HalDoc[] }>());
export const AdvertisersLoadFailure = createAction(ActionTypes.CAMPAIGN_ADVERTISERS_LOAD_FAILURE, props<{ error: any }>());

export const AddAdvertiser = createAction(ActionTypes.CAMPAIGN_ADD_ADVERTISER, props<{ name: string }>());
export const AddAdvertiserSuccess = createAction(ActionTypes.CAMPAIGN_ADD_ADVERTISER_SUCCESS, props<{ doc: HalDoc }>());
export const AddAdvertiserFailure = createAction(ActionTypes.CAMPAIGN_ADD_ADVERTISER_FAILURE, props<{ error: any }>());

const all = union({
  AdvertisersLoad,
  AdvertisersLoadSuccess,
  AdvertisersLoadFailure,
  AddAdvertiser,
  AddAdvertiserSuccess,
  AddAdvertiserFailure
});
export type AdvertiserActions = typeof all;
