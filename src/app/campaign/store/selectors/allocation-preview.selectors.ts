import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '..';
import { selectCampaignStoreState } from './campaign.selectors';
import { selectRoutedFlightId } from './flight.selectors';
import { selectIds } from '../reducers/allocation-preview.reducer';

export const selectAllocationPreviewState = createSelector(
  selectCampaignStoreState,
  (state: CampaignStoreState) => state && state.allocationPreview
);
export const selectAllocationPreviewIds = createSelector(selectAllocationPreviewState, selectIds);
export const selectAllocationPreviewEntities = createSelector(selectAllocationPreviewState, state => state && state['entities']);
export const selectRoutedFlightAllocationPreviewEntities = createSelector(
  selectAllocationPreviewState,
  selectRoutedFlightId,
  selectAllocationPreviewEntities,
  (state, flightId, entities) => flightId === state.flightId && entities
);

export const selectAllocationPreviewError = createSelector(selectAllocationPreviewState, state => state && state.error);
export const selectRoutedFlightAllocationPreviewError = createSelector(
  selectAllocationPreviewState,
  selectRoutedFlightId,
  selectAllocationPreviewError,
  (state, flightId, error) => flightId === state.flightId && error
);
