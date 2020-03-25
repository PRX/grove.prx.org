import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { CampaignState } from './models';
import * as fromCampaign from './reducers/campaign.reducer';
import * as fromFlight from './reducers/flight.reducer';
import * as fromAllocationPreview from './reducers/allocation-preview.reducer';

export interface CampaignStoreState {
  campaign: CampaignState;
  flights: fromFlight.State;
  allocationPreview: fromAllocationPreview.State;
}

export const reducers: ActionReducerMap<CampaignStoreState> = {
  campaign: fromCampaign.reducer,
  flights: fromFlight.reducer,
  allocationPreview: fromAllocationPreview.reducer
};

export const metaReducers: MetaReducer<CampaignStoreState>[] = !environment.production ? [] : [];
