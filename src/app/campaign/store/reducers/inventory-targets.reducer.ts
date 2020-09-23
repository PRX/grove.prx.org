import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as inventoryActions from '../actions/inventory-action.creator';
import { docToInventoryTargets, InventoryTargets } from '../models';

export interface State extends EntityState<InventoryTargets> {
  error?: any;
}

export const adapter: EntityAdapter<InventoryTargets> = createEntityAdapter<InventoryTargets>({ selectId: targets => targets.inventoryId });

export const initialState: State = adapter.getInitialState({});

// tslint:disable-next-line: variable-name
const _reducer = createReducer(
  initialState,
  on(inventoryActions.InventoryTargetsLoadSuccess, (state, action) => {
    return {
      ...adapter.upsertOne(docToInventoryTargets(action.doc), state),
      error: null
    };
  }),
  on(inventoryActions.InventoryTargetsLoadFailure, (state, action) => ({ ...state, error: action.error }))
);
export function reducer(state: any, action: any) {
  return _reducer(state, action);
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
