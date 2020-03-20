import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes, AllocationPreviewActions } from '../actions';
import { docToAllocationPreviewParams, docToAllocationPreview, AllocationPreview } from '../models';

export interface State extends EntityState<AllocationPreview> {
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

export const selectId = allocationPreview => allocationPreview.zone + '_' + allocationPreview.date.toISOString().slice(0, 10);
export const adapter: EntityAdapter<AllocationPreview> = createEntityAdapter<AllocationPreview>({
  selectId
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
      const allocations = action.payload.allocationPreviewDoc['allocations'].map(allocation => docToAllocationPreview(allocation));
      return adapter.addAll(allocations, { ...state, ...docToAllocationPreviewParams(action.payload.allocationPreviewDoc), error: null });
    }
    case ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD_FAILURE: {
      return { ...state, error: action.payload.error };
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
