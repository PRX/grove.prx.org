import { Action } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { HalDoc } from 'ngx-prx-styleguide';

export class AdvertisersLoad implements Action {
  readonly type = ActionTypes.CAMPAIGN_ADVERTISERS_LOAD;

  constructor(public payload: {}) {}
}
export class AdvertisersLoadSuccess implements Action {
  readonly type = ActionTypes.CAMPAIGN_ADVERTISERS_LOAD_SUCCESS;

  constructor(public payload: { docs: HalDoc[] }) {}
}
export class AdvertisersLoadFailure implements Action {
  readonly type = ActionTypes.CAMPAIGN_ADVERTISERS_LOAD_FAILURE;

  constructor(public payload: { error: any }) {}
}

export class AddAdvertiser implements Action {
  readonly type = ActionTypes.CAMPAIGN_ADD_ADVERTISER;

  constructor(public payload: { name: string }) {}
}
export class AddAdvertiserSuccess implements Action {
  readonly type = ActionTypes.CAMPAIGN_ADD_ADVERTISER_SUCCESS;

  constructor(public payload: { doc: HalDoc }) {}
}
export class AddAdvertiserFailure implements Action {
  readonly type = ActionTypes.CAMPAIGN_ADD_ADVERTISER_FAILURE;

  constructor(public payload: { error: any }) {}
}

export type AdvertiserActions =
  | AdvertisersLoad
  | AdvertisersLoadSuccess
  | AdvertisersLoadFailure
  | AddAdvertiser
  | AddAdvertiserSuccess
  | AddAdvertiserFailure;
