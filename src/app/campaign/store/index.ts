import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { CampaignState } from './models';
import * as fromAccount from './reducers/account.reducer';
import * as fromAdvertiser from './reducers/advertiser.reducer';
import * as fromCampaign from './reducers/campaign.reducer';
import * as fromCreative from './reducers/creative.reducer';
import * as fromFlight from './reducers/flight.reducer';
import * as fromFlightDays from './reducers/flight-days.reducer';
import * as fromFlightOverlap from './reducers/flight-overlap.reducer';
import * as fromInventory from './reducers/inventory.reducer';

export interface CampaignStoreState {
  account: fromAccount.State;
  advertiser: fromAdvertiser.State;
  campaign: CampaignState;
  creatives: fromCreative.State;
  flights: fromFlight.State;
  flightDays: fromFlightDays.State;
  flightOverlap: fromFlightOverlap.State;
  inventory: fromInventory.State;
}

export const reducers: ActionReducerMap<CampaignStoreState> = {
  account: fromAccount.reducer,
  advertiser: fromAdvertiser.reducer,
  campaign: fromCampaign.reducer,
  creatives: fromCreative.reducer,
  flights: fromFlight.reducer,
  flightDays: fromFlightDays.reducer,
  flightOverlap: fromFlightOverlap.reducer,
  inventory: fromInventory.reducer
};

export const metaReducers: MetaReducer<CampaignStoreState>[] = !environment.production ? [] : [];
