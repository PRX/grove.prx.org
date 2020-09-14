import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CampaignStoreState } from '../';
import { Campaign, CampaignState } from '../models';
import { selectRouterStateParams } from '../../../store/router-store/router.selectors';
import { HalDoc } from 'ngx-prx-styleguide';

export const selectCampaignStoreState = createFeatureSelector('campaignState');
export const selectCampaign = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.campaign);

export const selectRoutedCampaignId = createSelector(
  selectCampaign,
  selectRouterStateParams,
  (state: CampaignState, params): number | string => (params && +params.id) || 'new'
);
export const selectCampaignId = createSelector(
  selectCampaign,
  (state: CampaignState): number | string => (state && state.remoteCampaign && state.remoteCampaign.id) || 'new'
);
export const selectLocalCampaign = createSelector(selectCampaign, (state: CampaignState): Campaign => state && state.localCampaign);
export const selectLocalCampaignName = createSelector(selectLocalCampaign, (campaign: Campaign) => campaign && campaign.name);
export const selectLocalCampaignActualCount = createSelector(selectLocalCampaign, (campaign: Campaign) => campaign && campaign.actualCount);
export const selectCampaignDoc = createSelector(selectCampaign, (state: CampaignState): HalDoc => state && state.doc);
export const selectCampaignLoaded = createSelector(selectCampaign, (state: CampaignState): boolean => state && state.loaded);
export const selectCampaignLoading = createSelector(selectCampaign, (state: CampaignState): boolean => state && state.loading);
export const selectCampaignSaving = createSelector(selectCampaign, (state: CampaignState): boolean => state && state.saving);
export const selectCampaignError = createSelector(selectCampaign, (state: CampaignState): boolean => state && state.error);
