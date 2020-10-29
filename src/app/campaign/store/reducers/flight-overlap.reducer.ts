import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as flightOverlapActions from '../actions/flight-overlap-action.creator';
import { docToFlight, FlightOverlap, overlapFilters } from '../models';

export type State = EntityState<FlightOverlap>;

export const adapter: EntityAdapter<FlightOverlap> = createEntityAdapter<FlightOverlap>({
  selectId: (state: FlightOverlap) => state.flightId
});

export const initialState: State = adapter.getInitialState({});

// tslint:disable-next-line: variable-name
const _reducer = createReducer(
  initialState,
  on(flightOverlapActions.FlightOverlapLoad, (state, action) => {
    const flightId = action.flight.id;
    const filters = overlapFilters(action.flight);
    return adapter.upsertOne({ flightId, filters, overlapping: null, loading: true, error: null }, state);
  }),
  on(flightOverlapActions.FlightOverlapLoadSuccess, (state, action) => {
    const flightId = action.flight.id;
    const filters = overlapFilters(action.flight);
    const overlapping = action.overlap.map(d => docToFlight(d)).filter(f => f.id !== flightId);
    if (state.entities[flightId].filters === filters) {
      return adapter.upsertOne({ flightId, filters, overlapping, loading: false, error: null }, state);
    } else {
      return state;
    }
  }),
  on(flightOverlapActions.FlightOverlapLoadFailure, (state, action) => {
    const flightId = action.flight.id;
    const filters = overlapFilters(action.flight);
    if (state.entities[flightId].filters === filters) {
      return adapter.upsertOne({ flightId, filters, overlapping: null, loading: false, error: action.error }, state);
    } else {
      return state;
    }
  })
);

export function reducer(state: any, action: any) {
  return _reducer(state, action);
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
