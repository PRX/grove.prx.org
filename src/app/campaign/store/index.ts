import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { CampaignState } from './models';
import * as fromAccount from './reducers/account.reducer';
import * as fromAdvertiser from './reducers/advertiser.reducer';
import * as fromCampaign from './reducers/campaign.reducer';
import * as fromFlight from './reducers/flight.reducer';
import * as fromFlightDays from './reducers/flight-days.reducer';
import * as fromInventory from './reducers/inventory.reducer';

export interface CampaignStoreState {
  account: fromAccount.State;
  advertiser: fromAdvertiser.State;
  campaign: CampaignState;
  flights: fromFlight.State;
  flightDays: fromFlightDays.State;
  inventory: fromInventory.State;
}

export const reducers: ActionReducerMap<CampaignStoreState> = {
  account: fromAccount.reducer,
  advertiser: fromAdvertiser.reducer,
  campaign: fromCampaign.reducer,
  flights: fromFlight.reducer,
  flightDays: fromFlightDays.reducer,
  inventory: fromInventory.reducer
};

export const metaReducers: MetaReducer<CampaignStoreState>[] = !environment.production ? [] : [];
