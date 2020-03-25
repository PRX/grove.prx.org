import { MockHalDoc } from 'ngx-prx-styleguide';
import * as allocationPreviewActions from '../actions/allocation-preview-action.creator';
import {
  flightFixture,
  allocationPreviewParamsFixture,
  allocationPreviewFixture,
  allocationPreviewData
} from '../models/campaign-state.factory';
import { reducer, initialState, selectId, selectIds } from './allocation-preview.reducer';

describe('Allocation Preview Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should remove prior entries and set allocation preview flightId and set_inventory_uri on allocation preview load', () => {
    const { id: flightId, set_inventory_uri, name, startAt, endAt, totalGoal, zones } = flightFixture;
    const result = reducer(
      initialState,
      new allocationPreviewActions.AllocationPreviewLoad({
        flightId,
        createdAt: new Date(),
        set_inventory_uri,
        name,
        startAt,
        endAt,
        totalGoal,
        dailyMinimum: 12,
        zones
      })
    );
    expect(result.flightId).toEqual(flightId);
    expect(result.set_inventory_uri).toEqual(set_inventory_uri);
    expect(result.ids.length).toEqual(0);
    expect(Object.keys(result.entities).length).toEqual(0);
  });

  it('should not clear flightId on load when results do not contain flight id (temp flight id, flight not yet created)', () => {
    const { flightId: notTheFlightId, ...paramsMinusFlightId } = allocationPreviewParamsFixture;
    const flightId = Date.now();
    let state = reducer(
      initialState,
      new allocationPreviewActions.AllocationPreviewLoad({
        flightId,
        createdAt: undefined,
        ...paramsMinusFlightId
      })
    );
    state = reducer(
      state,
      new allocationPreviewActions.AllocationPreviewLoadSuccess({
        allocationPreviewDoc: new MockHalDoc({
          ...paramsMinusFlightId,
          allocations: allocationPreviewData
        })
      })
    );
    expect(state.flightId).toEqual(flightId);
  });

  it('should set allocation preview from allocation preview load success', () => {
    const result = reducer(
      initialState,
      new allocationPreviewActions.AllocationPreviewLoadSuccess({
        allocationPreviewDoc: new MockHalDoc({
          ...allocationPreviewParamsFixture,
          allocations: allocationPreviewData
        })
      })
    );
    expect(selectIds(result).length).toBe(allocationPreviewData.length);
    expect(result.entities[selectId(allocationPreviewFixture[0])]).toMatchObject(allocationPreviewFixture[0]);
  });

  it('should set the allocation preview error on load failure', () => {
    const result = reducer(
      initialState,
      new allocationPreviewActions.AllocationPreviewLoadFailure({ error: { body: { status: 422, message: 'no allocatable days' } } })
    );
    expect(result.error.body.message).toEqual('no allocatable days');
  });
});
