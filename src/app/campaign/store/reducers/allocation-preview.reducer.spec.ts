import { MockHalDoc } from 'ngx-prx-styleguide';
import * as actions from '../actions';
import { allocationPreviewParamsFixture, allocationPreviewFixture, allocationPreviewData } from '../models/campaign-state.factory';
import { reducer, initialState, selectId, selectIds } from './allocation-preview.reducer';

describe('Allocation Preview Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should set allocation preview from allocation preview load success', () => {
    const result = reducer(
      initialState,
      new actions.AllocationPreviewLoadSuccess({
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
      new actions.AllocationPreviewLoadFailure({ error: { body: { status: 422, message: 'no allocatable days' } } })
    );
    expect(result.error.body.message).toEqual('no allocatable days');
  });
});
