import { Action } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { HalDoc } from 'ngx-prx-styleguide';

export class AccountsLoad implements Action {
  readonly type = ActionTypes.CAMPAIGN_ACCOUNTS_LOAD;

  constructor(public payload: {}) {}
}
export class AccountsLoadSuccess implements Action {
  readonly type = ActionTypes.CAMPAIGN_ACCOUNTS_LOAD_SUCCESS;

  constructor(public payload: { docs: HalDoc[] }) {}
}
export class AccountsLoadFailure implements Action {
  readonly type = ActionTypes.CAMPAIGN_ACCOUNTS_LOAD_FAILURE;

  constructor(public payload: { error: any }) {}
}

export type AccountActions = AccountsLoad | AccountsLoadSuccess | AccountsLoadFailure;
