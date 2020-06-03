import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes } from '../actions/action.types';
import { AccountActions } from '../actions/account-action.creator';
import { docToAccount, Account } from '../models';

export interface State extends EntityState<Account> {
  error?: any;
}

export const adapter: EntityAdapter<Account> = createEntityAdapter<Account>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(state = initialState, action: AccountActions): State {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_ACCOUNTS_LOAD_SUCCESS: {
      return { ...adapter.addAll(action.docs.map(docToAccount), state), error: null };
    }
    case ActionTypes.CAMPAIGN_ACCOUNTS_LOAD_FAILURE: {
      return { ...state, error: action.error };
    }
    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
