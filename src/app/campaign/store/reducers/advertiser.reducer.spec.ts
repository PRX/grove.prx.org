import { MockHalDoc } from 'ngx-prx-styleguide';
import * as advertiserActions from '../actions/advertiser-action.creator';
import { advertisersFixture, advertiserDocsFixture } from '../models/campaign-state.factory';
import { reducer, initialState } from './advertiser.reducer';

describe('Advertiser Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('On Load Success', () => {
    it('should save advertisers on state', () => {
      const state = reducer(
        initialState,
        new advertiserActions.AdvertisersLoadSuccess({ docs: advertiserDocsFixture.map(a => new MockHalDoc(a)) })
      );
      expect(state.entities[advertiserDocsFixture[0].id]).toMatchObject(advertisersFixture[0]);
    });
  });

  describe('On Add Advertiser', () => {
    it('should save new advertiser on state', () => {
      const id = advertisersFixture[advertisersFixture.length - 1].id + 1;
      const state = reducer(
        initialState,
        new advertiserActions.AddAdvertiserSuccess({
          doc: new MockHalDoc({ id, name, _links: { self: { href: 'some/uri' } } })
        })
      );
      expect(state.entities[id]).toMatchObject({ id, name, set_advertiser_uri: 'some/uri' });
    });
  });

  describe('Error Handling', () => {
    it('should clear error on load success', () => {
      const state = reducer(
        { error: 'previous error', ids: [], entities: {} },
        new advertiserActions.AdvertisersLoadSuccess({ docs: advertiserDocsFixture.map(a => new MockHalDoc(a)) })
      );
      expect(state.error).toBeNull();
    });

    it('should set error on failure', () => {
      expect(initialState.error).not.toBeDefined();
      let state = reducer(initialState, new advertiserActions.AdvertisersLoadFailure({ error: 'something bad happened' }));
      expect(state.error).toBeDefined();
      state = reducer(initialState, new advertiserActions.AddAdvertiserFailure({ error: 'something even worse happened' }));
      expect(state.error).toBeDefined();
    });
  });
});
