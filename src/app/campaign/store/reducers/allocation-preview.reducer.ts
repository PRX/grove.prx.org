import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes } from '../actions/action.types';
import { AllocationPreviewActions } from '../actions/allocation-preview-action.creator';
import { docToAllocationPreviewParams, docToAllocationPreview, AllocationPreview } from '../models';

export interface State extends EntityState<AllocationPreview> {
  // additional entities state properties for the collection
  flightId: number;
  dailyMinimum: number;
  startAt: Date;
  endAt: Date;
  name: string;
  totalGoal: number;
  set_inventory_uri: string;
  zones: { id: string }[];
  error?: any;
}

export const selectId = (allocationPreview: AllocationPreview) =>
  allocationPreview.zone + '_' + allocationPreview.date.toISOString().slice(0, 10);
export const adapter: EntityAdapter<AllocationPreview> = createEntityAdapter<AllocationPreview>({
  selectId
});

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  flightId: undefined,
  dailyMinimum: undefined,
  startAt: undefined,
  endAt: undefined,
  name: undefined,
  totalGoal: undefined,
  set_inventory_uri: undefined,
  zones: undefined
});

export function reducer(state = initialState, action: AllocationPreviewActions): State {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD: {
      const { flightId, set_inventory_uri } = action.payload;
      return adapter.removeAll({ ...state, flightId, set_inventory_uri, error: null });
    }
    case ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD_SUCCESS: {
      const allocations = action.payload.allocationPreviewDoc['allocations'].map((allocation: any) => docToAllocationPreview(allocation));
      return adapter.addAll(allocations, { ...state, ...docToAllocationPreviewParams(action.payload.allocationPreviewDoc) });
    }
    case ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD_FAILURE: {
      return { ...state, error: action.payload.error };
    }
    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
