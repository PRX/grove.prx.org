import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '..';
import { selectCampaignStoreState } from './campaign.selectors';
import { selectIds, selectEntities, selectAll } from '../reducers/flight-overlap.reducer';
import { selectRoutedFlightId } from './flight.selectors';

export const selectFlightOverlapState = createSelector(
  selectCampaignStoreState,
  (state: CampaignStoreState) => state && state.flightOverlap
);
export const selectFlightOverlapIds = createSelector(selectFlightOverlapState, selectIds);
export const selectFlightOverlapEntities = createSelector(selectFlightOverlapState, selectEntities);
export const selectAllFlightOverlaps = createSelector(selectFlightOverlapState, selectAll);

export const selectCurrentFlightOverlap = createSelector(selectRoutedFlightId, selectFlightOverlapEntities, (flightId, entities) => {
  return entities && entities[flightId];
});

export const selectCurrentFlightOverlapFilters = createSelector(selectCurrentFlightOverlap, overlap => overlap.filters);
