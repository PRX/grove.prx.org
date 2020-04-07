import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '../';
import { selectCampaignStoreState } from './campaign.selectors';
import { Account } from '../models';
import { selectIds, selectEntities, selectAll } from '../reducers/account.reducer';

export const selectAccountState = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.account);
export const selectAccountIds = createSelector(selectAccountState, selectIds);
export const selectAccountEntities = createSelector(selectAccountState, selectEntities);
export const selectAllAccounts = createSelector(selectAccountState, selectAll);
