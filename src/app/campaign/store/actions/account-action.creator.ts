import { createAction, props, union } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { HalDoc } from 'ngx-prx-styleguide';

export const AccountsLoad = createAction(ActionTypes.CAMPAIGN_ACCOUNTS_LOAD);
export const AccountsLoadSuccess = createAction(ActionTypes.CAMPAIGN_ACCOUNTS_LOAD_SUCCESS, props<{ docs: HalDoc[] }>());
export const AccountsLoadFailure = createAction(ActionTypes.CAMPAIGN_ACCOUNTS_LOAD_FAILURE, props<{ error: any }>());

const all = union({ AccountsLoad, AccountsLoadSuccess, AccountsLoadFailure });
export type AccountActions = typeof all;
