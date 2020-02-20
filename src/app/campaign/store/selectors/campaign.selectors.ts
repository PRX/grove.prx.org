import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CampaignStoreState } from '../';
import { CampaignState } from '../reducers';

export const selectCampaignStoreState = createFeatureSelector('campaignState');
export const selectCampaign = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.campaign);

export const selectLocalCampaign = createSelector(selectCampaign, (state: CampaignState) => state && state.localCampaign);
export const selectCampaignDoc = createSelector(selectCampaign, (state: CampaignState) => state && state.doc);
