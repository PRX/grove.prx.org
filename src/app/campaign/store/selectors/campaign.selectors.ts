import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CampaignStoreState } from '../';
import { Campaign, CampaignState } from '../reducers';
import { HalDoc } from 'ngx-prx-styleguide';

export const selectCampaignStoreState = createFeatureSelector('campaignState');
export const selectCampaign = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.campaign);

export const selectLocalCampaign = createSelector(selectCampaign, (state: CampaignState): Campaign => state && state.localCampaign);
export const selectCampaignDoc = createSelector(selectCampaign, (state: CampaignState): HalDoc => state && state.doc);
export const selectCampaignLoading = createSelector(selectCampaign, (state: CampaignState): boolean => state && state.loading);
export const selectCampaignSaving = createSelector(selectCampaign, (state: CampaignState): boolean => state && state.saving);
