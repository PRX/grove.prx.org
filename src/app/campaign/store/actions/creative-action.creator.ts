import { createAction, props, union } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { HalDoc } from 'ngx-prx-styleguide';
import { Creative } from '../models';

export const CreativeNew = createAction(ActionTypes.CREATIVE_NEW);

export const CreativeLoad = createAction(ActionTypes.CREATIVE_LOAD, props<{ id: number }>());
export const CreativeLoadSuccess = createAction(ActionTypes.CREATIVE_LOAD_SUCCESS, props<{ creativeDoc: HalDoc }>());
export const CreativeLoadFailure = createAction(ActionTypes.CREATIVE_LOAD_FAILURE, props<{ error }>());

export const CreativeFormUpdate = createAction(
  ActionTypes.CREATIVE_FORM_UPDATE,
  props<{ creative: Creative; changed: boolean; valid: boolean }>()
);

// could get the flightId into this action, but don't have the zone --> will also have to add zone to route
export const CreativeCreate = createAction(
  ActionTypes.CREATIVE_CREATE,
  props<{ campaignId?: string | number; flightId?: number; zoneId?: string; creative: Creative }>()
);
export const CreativeCreateSuccess = createAction(
  ActionTypes.CREATIVE_CREATE_SUCCESS,
  props<{ campaignId?: string | number; flightId?: number; zoneId?: string; creativeDoc: HalDoc }>()
);
export const CreativeCreateFailure = createAction(ActionTypes.CREATIVE_CREATE_FAILURE, props<{ error: any }>());

export const CreativeUpdate = createAction(
  ActionTypes.CREATIVE_UPDATE,
  props<{ campaignId?: string | number; flightId?: number; zoneId?: string; creativeDoc?: HalDoc; creative: Creative }>()
);
export const CreativeUpdateSuccess = createAction(
  ActionTypes.CREATIVE_UPDATE_SUCCESS,
  props<{ campaignId?: string | number; flightId?: number; zoneId?: string; creativeDoc: HalDoc }>()
);
export const CreativeUpdateFailure = createAction(ActionTypes.CREATIVE_UPDATE_FAILURE, props<{ error: any }>());

export const CreativeLoadList = createAction(ActionTypes.CREATIVE_LOAD_LIST);
export const CreativeLoadListSuccess = createAction(ActionTypes.CREATIVE_LOAD_LIST_SUCCESS, props<{ creativeDocs: HalDoc[] }>());
export const CreativeLoadListFailure = createAction(ActionTypes.CREATIVE_LOAD_LIST_FAILURE, props<{ error }>());

const all = union({
  CreativeNew,
  CreativeLoad,
  CreativeLoadSuccess,
  CreativeLoadFailure,
  CreativeFormUpdate,
  CreativeCreate,
  CreativeCreateSuccess,
  CreativeCreateFailure,
  CreativeUpdate,
  CreativeUpdateSuccess,
  CreativeUpdateFailure,
  CreativeLoadList,
  CreativeLoadListSuccess,
  CreativeLoadListFailure
});
export type CreativeActions = typeof all;
