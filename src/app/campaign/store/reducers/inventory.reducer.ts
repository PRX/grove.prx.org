import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as inventoryActions from '../actions/inventory-action.creator';
import { docToInventory, Inventory } from '../models';

export interface State extends EntityState<Inventory> {
  error?: any;
}

export const adapter: EntityAdapter<Inventory> = createEntityAdapter<Inventory>();

export const initialState: State = adapter.getInitialState({});

// tslint:disable-next-line: variable-name
const _reducer = createReducer(
  initialState,
  on(inventoryActions.InventoryLoadSuccess, (state, action) => ({
    ...adapter.addAll(action.docs.map(docToInventory), state),
    error: null
  })),
  on(inventoryActions.InventoryLoadFailure, (state, action) => ({ ...state, error: action.error })),
  on(inventoryActions.InventoryTargetsLoadSuccess, (state, action) => {
    const { inventoryId, episodes, countries } = action.doc as any;
    return {
      ...adapter.updateOne({ id: inventoryId, changes: { episodeTargets: episodes, countryTargets: countries } }, state),
      error: null
    };
  }),
  on(inventoryActions.InventoryTargetsLoadFailure, (state, action) => ({ ...state, error: action.error }))
);
export function reducer(state: any, action: any) {
  return _reducer(state, action);
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
