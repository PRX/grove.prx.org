import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as accountActions from '../actions/account-action.creator';
import { docToAccount, Account } from '../models';

export interface State extends EntityState<Account> {
  error?: any;
}

export const adapter: EntityAdapter<Account> = createEntityAdapter<Account>();

export const initialState: State = adapter.getInitialState({});

// tslint:disable-next-line: variable-name
const _reducer = createReducer(
  initialState,
  on(accountActions.AccountsLoadSuccess, (state, action) => ({ ...adapter.setAll(action.docs.map(docToAccount), state), error: null })),
  on(accountActions.AccountsLoadFailure, (state, action) => ({ ...state, error: action.error }))
);
export function reducer(state, action) {
  return _reducer(state, action);
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
