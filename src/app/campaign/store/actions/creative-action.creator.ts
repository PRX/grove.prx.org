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

export const CreativeSave = createAction(ActionTypes.CREATIVE_SAVE, props<{ creativeDoc?: HalDoc; creative: Creative }>());
export const CreativeSaveSuccess = createAction(ActionTypes.CREATIVE_SAVE_SUCCESS, props<{ creativeDoc: HalDoc }>());
export const CreativeSaveFailure = createAction(ActionTypes.CREATIVE_SAVE_FAILURE, props<{ error: any }>());

export const CreativeLoadList = createAction(ActionTypes.CREATIVE_LOAD_LIST);
export const CreativeLoadListSuccess = createAction(ActionTypes.CREATIVE_LOAD_LIST_SUCCESS, props<{ creativeDocs: HalDoc[] }>());
export const CreativeLoadListFailure = createAction(ActionTypes.CREATIVE_LOAD_LIST_FAILURE, props<{ error }>());

const all = union({
  CreativeNew,
  CreativeLoad,
  CreativeLoadSuccess,
  CreativeLoadFailure,
  CreativeFormUpdate,
  CreativeSave,
  CreativeSaveSuccess,
  CreativeSaveFailure,
  CreativeLoadList,
  CreativeLoadListSuccess,
  CreativeLoadListFailure
});
export type CreativeActions = typeof all;
