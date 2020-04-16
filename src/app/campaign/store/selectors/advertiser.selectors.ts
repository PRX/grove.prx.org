import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '..';
import { selectCampaignStoreState } from './campaign.selectors';
import { Advertiser } from '../models';
import { selectIds, selectEntities, selectAll } from '../reducers/advertiser.reducer';

export const selectAdvertiserState = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.advertiser);
export const selectAdvertiserIds = createSelector(selectAdvertiserState, selectIds);
export const selectAdvertiserEntities = createSelector(selectAdvertiserState, selectEntities);
export const selectAllAdvertisers = createSelector(selectAdvertiserState, selectAll);

export const selectAllAdvertisersOrderByName = createSelector(
  selectAllAdvertisers,
  advertisers => advertisers && advertisers.sort((a, b) => a.name.localeCompare(b.name))
);
