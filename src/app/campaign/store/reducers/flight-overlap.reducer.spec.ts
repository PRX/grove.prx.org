import * as flightOverlapActions from '../actions/flight-overlap-action.creator';
import { reducer, initialState } from './flight-overlap.reducer';
import { flightFixture, flightDocFixture } from '../models/campaign-state.factory';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { overlapFilters } from '../models';

describe('FlightOverlap Reducer', () => {
  const flightId = flightFixture.id.toString();
  const flight = flightFixture;
  const overlap = [new MockHalDoc({ ...flightDocFixture, id: 999 })];

  it('ignores unknown actions', () => {
    const result = reducer(initialState, {});
    expect(result).toBe(initialState);
  });

  it('sets flight-overlap loading', () => {
    const state = reducer(initialState, flightOverlapActions.FlightOverlapLoad({ flight }));

    expect(Object.keys(state.entities)).toEqual([flightId]);
    expect(state.entities[flightId]).toEqual({
      flightId: flightFixture.id,
      filters: overlapFilters(flightFixture),
      overlapping: null,
      loading: true,
      error: null
    });
  });

  it('sets flight-overlap on success', () => {
    const loadState = reducer(initialState, flightOverlapActions.FlightOverlapLoad({ flight }));
    const state = reducer(loadState, flightOverlapActions.FlightOverlapLoadSuccess({ flight, overlap }));

    expect(Object.keys(state.entities)).toEqual([flightId]);
    expect(state.entities[flightId]).toMatchObject({
      flightId: flightFixture.id,
      filters: overlapFilters(flightFixture),
      loading: false,
      error: null
    });
    expect(state.entities[flightId].overlapping.map(o => o.id)).toEqual([999]);
  });

  it('removes the current flight id from the overlap array', () => {
    const overlapWithThisFlight = [new MockHalDoc({ ...flightDocFixture, id: flight.id })];
    const loadState = reducer(initialState, flightOverlapActions.FlightOverlapLoad({ flight }));
    const state = reducer(loadState, flightOverlapActions.FlightOverlapLoadSuccess({ flight, overlap: overlapWithThisFlight }));

    expect(Object.keys(state.entities)).toEqual([flightId]);
    expect(state.entities[flightId]).toEqual({
      flightId: flightFixture.id,
      filters: overlapFilters(flightFixture),
      overlapping: [],
      loading: false,
      error: null
    });
  });

  it('does not set flight-overlap if filters have changed', () => {
    const initialFlight = { ...flight, set_inventory_uri: '/some/inventory/999' };
    const initialFilters = overlapFilters(initialFlight);
    const loadState = reducer(initialState, flightOverlapActions.FlightOverlapLoad({ flight: initialFlight }));

    // load success, but with different filters
    const state = reducer(loadState, flightOverlapActions.FlightOverlapLoadSuccess({ flight, overlap }));

    expect(Object.keys(state.entities)).toEqual([flightId]);
    expect(initialFilters).not.toEqual(overlapFilters(flightFixture));
    expect(state.entities[flightId]).toEqual({
      flightId: flightFixture.id,
      filters: initialFilters,
      overlapping: null,
      loading: true,
      error: null
    });
  });

  it('sets flight-overlap load errors', () => {
    const loadState = reducer(initialState, flightOverlapActions.FlightOverlapLoad({ flight }));
    const state = reducer(loadState, flightOverlapActions.FlightOverlapLoadFailure({ flight, error: 'something' }));

    expect(Object.keys(state.entities)).toEqual([flightId]);
    expect(state.entities[flightId]).toEqual({
      flightId: flightFixture.id,
      filters: overlapFilters(flightFixture),
      overlapping: null,
      loading: false,
      error: 'something'
    });
  });
});
