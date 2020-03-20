import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes, AllocationPreviewActions } from '../actions';
import { docToAllocationPreview, docToAllocations, Allocation } from '../models';

export interface State extends EntityState<Allocation> {
  // additional entities state properties for the collection
  flightId?: number;
  dailyMinimum: number;
  startAt: Date;
  endAt: Date;
  name: string;
  totalGoal: number;
  zones: string[];
  error?: any;
}

export const adapter: EntityAdapter<Allocation> = createEntityAdapter<Allocation>({
  selectId: allocation => allocation.zone + '_' + allocation.date.toISOString().slice(0, 10)
});

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  dailyMinimum: undefined,
  startAt: undefined,
  endAt: undefined,
  name: undefined,
  totalGoal: undefined,
  zones: undefined
});

export function reducer(state = initialState, action: AllocationPreviewActions): State {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD_SUCCESS: {
      const allocations = docToAllocations(action.payload.allocationPreviewDoc['allocations']);
      return adapter.addAll(allocations, { ...state, ...docToAllocationPreview(action.payload.allocationPreviewDoc), error: null });
    }
    case ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD_FAILURE: {
      return { ...state, error: action.payload.error };
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
