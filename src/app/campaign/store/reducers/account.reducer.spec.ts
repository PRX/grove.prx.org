import { MockHalDoc } from 'ngx-prx-styleguide';
import * as accountActions from '../actions/account-action.creator';
import { accountsFixture } from '../models/campaign-state.factory';
import { reducer, initialState } from './account.reducer';

describe('Account Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('On Load Success', () => {
    it('should save accounts on state', () => {
      const state = reducer(initialState, accountActions.AccountsLoadSuccess({ docs: accountsFixture.map(a => new MockHalDoc(a)) }));
      expect(state.entities[accountsFixture[0].id]).toMatchObject(accountsFixture[0]);
    });
  });

  describe('Error Handling', () => {
    it('should clear error on load success', () => {
      const state = reducer(
        { error: 'previous error', ids: [], entities: {} },
        accountActions.AccountsLoadSuccess({ docs: accountsFixture.map(a => new MockHalDoc(a)) })
      );
      expect(state.error).toBeNull();
    });

    it('should set error on failure', () => {
      expect(initialState.error).not.toBeDefined();
      const state = reducer(initialState, accountActions.AccountsLoadFailure({ error: 'something bad happened' }));
      expect(state.error).toBeDefined();
    });
  });
});
