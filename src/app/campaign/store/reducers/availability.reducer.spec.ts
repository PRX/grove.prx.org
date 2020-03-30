import { MockHalDoc } from 'ngx-prx-styleguide';
import * as availabilityActions from '../actions/availability-action.creator';
import { flightFixture, availabilityParamsFixture, availabilityDaysFixture, availabilityData } from '../models/campaign-state.factory';
import { reducer, initialState, selectId, selectIds } from './availability.reducer';

describe('Availability Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('On Load Success', () => {
    it('should save allocation days with params keyed by flightId and zone', () => {
      const params = availabilityParamsFixture;
      const state = reducer(
        initialState,
        new availabilityActions.AvailabilityLoadSuccess({
          params,
          doc: new MockHalDoc({
            startDate: params.startDate.toISOString().slice(0, 10),
            endDate: params.endDate.toISOString().slice(0, 10),
            days: availabilityData
          })
        })
      );
      expect(state.entities[`${availabilityParamsFixture.flightId}_${availabilityParamsFixture.zone}`]).toMatchObject({
        params,
        days: availabilityDaysFixture
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error on load', () => {
      const { inventoryId, startDate, endDate, flightId, zone } = availabilityParamsFixture;
      const state = reducer(
        { error: 'previous error', ids: [], entities: {} },
        new availabilityActions.AvailabilityLoad({ inventoryId, startDate, endDate, zone, flightId, createdAt: new Date() })
      );
      expect(state.error).toBeNull();
    });

    it('should set error on failure', () => {
      expect(initialState.error).not.toBeDefined();
      const state = reducer(initialState, new availabilityActions.AvailabilityLoadFailure({ error: 'something bad happened' }));
      expect(state.error).toBeDefined();
    });
  });
});
