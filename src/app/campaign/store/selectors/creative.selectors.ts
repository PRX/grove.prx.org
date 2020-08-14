import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '../';
import { selectCampaignStoreState } from './campaign.selectors';
import { Creative, CreativeState } from '../models';
import { selectIds, selectEntities, selectAll } from '../reducers/creative.reducer';
import { selectRouterStateParams } from '../../../store/router-store/router.selectors';

export const selectCreativesState = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.creatives);
export const selectCreativeIds = createSelector(selectCreativesState, selectIds);
export const selectCreativeEntities = createSelector(selectCreativesState, selectEntities);
export const selectAllCreatives = createSelector(selectCreativesState, selectAll);

export const selectRoutedCreativeId = createSelector(selectRouterStateParams, (params): string => {
  return params && params.creativeId;
});

export const selectRoutedCreative = createSelector(
  selectCreativeEntities,
  selectRoutedCreativeId,
  (creatives, id): CreativeState => creatives && creatives[id]
);
