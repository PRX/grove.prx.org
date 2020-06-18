import * as inventoryActions from '../actions/inventory-action.creator';
import { reducer, initialState } from './inventory.reducer';
import {
  inventoryFixture,
  inventoryDocsFixture,
  inventoryTargetsDocFixture,
  inventoryTargetsFixture
} from '../models/campaign-state.factory';

describe('Inventory Reducer', () => {
  it('ignores unknown actions', () => {
    const result = reducer(initialState, {});
    expect(result).toBe(initialState);
  });

  it('sets inventory on load success', () => {
    const state = reducer(initialState, inventoryActions.InventoryLoadSuccess({ docs: inventoryDocsFixture }));
    expect(Object.keys(state.entities)).toEqual(['1', '2']);
    expect(state.entities['1']).toMatchObject(inventoryFixture[0]);
    expect(state.entities['2']).toMatchObject(inventoryFixture[1]);
  });

  it('sets and clears inventory load errors', () => {
    let state = reducer(initialState, inventoryActions.InventoryLoadFailure({ error: 'something bad' }));
    expect(state.error).toEqual('something bad');
    state = reducer(state, inventoryActions.InventoryLoadSuccess({ docs: [] }));
    expect(state.error).toBeNull();
  });

  it('sets inventory targets on load success', () => {
    let state = reducer(initialState, inventoryActions.InventoryLoadSuccess({ docs: inventoryDocsFixture }));
    expect(Object.keys(state.entities)).toEqual(['1', '2']);
    expect(state.entities['1'].targets).toBeUndefined();
    expect(state.entities['2'].targets).toBeUndefined();

    state = reducer(state, inventoryActions.InventoryTargetsLoadSuccess({ doc: inventoryTargetsDocFixture }));
    expect(inventoryTargetsDocFixture['inventoryId']).toEqual(1);
    expect(state.entities['1'].targets).toMatchObject(inventoryTargetsFixture);
    expect(state.entities['2'].targets).toBeUndefined();
  });

  it('sets and clears inventory targets load errors', () => {
    let state = reducer(initialState, inventoryActions.InventoryTargetsLoadFailure({ error: 'something bad' }));
    expect(state.error).toEqual('something bad');
    state = reducer(state, inventoryActions.InventoryTargetsLoadSuccess({ doc: inventoryTargetsDocFixture }));
    expect(state.error).toBeNull();
  });
});
