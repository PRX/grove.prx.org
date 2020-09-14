import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '../';
import { selectCampaignStoreState } from './campaign.selectors';
import { CreativeState } from '../models';
import { selectIds, selectEntities, selectAll } from '../reducers/creative.reducer';
import { selectRouterStateParams, selectRouterState } from '../../../store/router-store/router.selectors';

export const selectCreativesState = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.creatives);
export const selectCreativeIds = createSelector(selectCreativesState, selectIds);
export const selectCreativeEntities = createSelector(selectCreativesState, selectEntities);
export const selectAllCreatives = createSelector(selectCreativesState, selectAll);

export const selectCreativeParams = createSelector(selectCreativesState, state => state && state.params);
export const selectCreativeTotal = createSelector(selectCreativesState, state => state && state.total);

export const selectRoutedCreativeId = createSelector(selectRouterStateParams, (params): string => {
  return params && params.creativeId;
});

export const selectRoutedFlightZoneId = createSelector(selectRouterStateParams, (params): string => params && params.zoneId);

export const selectRoutedCreative = createSelector(
  selectCreativeEntities,
  selectRoutedCreativeId,
  (creatives, id): CreativeState => creatives && creatives[id]
);

export const selectCreativeById = createSelector(
  selectCreativeEntities,
  (creatives, props): CreativeState => creatives && creatives[props.id] && creatives[props.id].creative
);

export const selectShowCreativeListRoute = createSelector(selectRouterState, state => state && state.url.indexOf('creative/list') > -1);
export const selectCreativeListCurrentPage = createSelector(selectCreativeParams, params => params && params.page);
export const selectCreativeListPageOrderedByCreatedAt = createSelector(selectAllCreatives, selectCreativeListCurrentPage, (states, page) =>
  states
    // filter out any 'new' temp creatives on the state and filter to creatives on current page
    .filter(state => state && state.creative && state.creative.createdAt && ((!page && state.page === 1) || state.page === page))
    .map(state => state.creative)
    .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf())
);
