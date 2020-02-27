import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import * as fromCampaign from './reducers/campaign.reducer';

export interface CampaignStoreState {
  campaign: fromCampaign.CampaignState;
}

export const reducers: ActionReducerMap<CampaignStoreState> = {
  campaign: fromCampaign.reducer
};

export const metaReducers: MetaReducer<CampaignStoreState>[] = !environment.production ? [] : [];
