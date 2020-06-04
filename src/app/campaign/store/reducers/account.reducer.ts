import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as accountActions from '../actions/account-action.creator';
import { docToAccount, Account } from '../models';

export interface State extends EntityState<Account> {
  error?: any;
}

export const adapter: EntityAdapter<Account> = createEntityAdapter<Account>();

export const initialState: State = adapter.getInitialState({});

export const reducer = createReducer(
  initialState,
  on(accountActions.AccountsLoadSuccess, (state, action) => ({ ...adapter.addAll(action.docs.map(docToAccount), state), error: null })),
  on(accountActions.AccountsLoadFailure, (state, action) => ({ ...state, error: action.error }))
);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
