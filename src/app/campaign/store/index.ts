import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { CampaignState } from './models';
import * as fromAccount from './reducers/account.reducer';
import * as fromAdvertiser from './reducers/advertiser.reducer';
import * as fromAllocationPreview from './reducers/allocation-preview.reducer';
import * as fromAvailability from './reducers/availability.reducer';
import * as fromCampaign from './reducers/campaign.reducer';
import * as fromFlight from './reducers/flight.reducer';

export interface CampaignStoreState {
  account: fromAccount.State;
  advertiser: fromAdvertiser.State;
  allocationPreview: fromAllocationPreview.State;
  availability: fromAvailability.State;
  campaign: CampaignState;
  flights: fromFlight.State;
}

export const reducers: ActionReducerMap<CampaignStoreState> = {
  account: fromAccount.reducer,
  advertiser: fromAdvertiser.reducer,
  allocationPreview: fromAllocationPreview.reducer,
  availability: fromAvailability.reducer,
  campaign: fromCampaign.reducer,
  flights: fromFlight.reducer
};

export const metaReducers: MetaReducer<CampaignStoreState>[] = !environment.production ? [] : [];
