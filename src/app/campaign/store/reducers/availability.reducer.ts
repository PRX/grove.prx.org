import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes } from '../actions/action.types';
import { AvailabilityActions } from '../actions/availability-action.creator';
import { docToAvailabilityDay, Availability } from '../models';

export interface State extends EntityState<Availability> {
  // additional entities state properties for the collection
  error?: any;
}

export const selectId = availability => availability.params.flightId + '_' + availability.params.zone;
export const adapter: EntityAdapter<Availability> = createEntityAdapter<Availability>({
  selectId
});

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(state = initialState, action: AvailabilityActions): State {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_AVAILABILITY_LOAD: {
      return { ...state, error: null };
    }
    case ActionTypes.CAMPAIGN_AVAILABILITY_LOAD_SUCCESS: {
      const { doc, params } = action.payload;
      const days = doc['days'].map(availability => docToAvailabilityDay(availability));
      return adapter.upsertOne({ params, days }, state);
    }
    case ActionTypes.CAMPAIGN_AVAILABILITY_LOAD_FAILURE: {
      return { ...state, error: action.payload.error };
    }
    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
