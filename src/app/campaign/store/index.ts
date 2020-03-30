import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { CampaignState } from './models';
import * as fromCampaign from './reducers/campaign.reducer';
import * as fromFlight from './reducers/flight.reducer';
import * as fromAllocationPreview from './reducers/allocation-preview.reducer';
import * as fromAvailability from './reducers/availability.reducer';

export interface CampaignStoreState {
  campaign: CampaignState;
  flights: fromFlight.State;
  allocationPreview: fromAllocationPreview.State;
  availability: fromAvailability.State;
}

export const reducers: ActionReducerMap<CampaignStoreState> = {
  campaign: fromCampaign.reducer,
  flights: fromFlight.reducer,
  allocationPreview: fromAllocationPreview.reducer,
  availability: fromAvailability.reducer
};

export const metaReducers: MetaReducer<CampaignStoreState>[] = !environment.production ? [] : [];
