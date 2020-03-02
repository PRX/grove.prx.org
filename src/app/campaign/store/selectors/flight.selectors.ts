import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '../';
import { selectCampaignStoreState } from './campaign.selectors';
import { selectRouterStateParams } from '../../../store/router-store/router.selectors';
import { Flight, FlightState } from '../reducers';
import { HalDoc } from 'ngx-prx-styleguide';

export const selectFlightsState = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.flights);
export const selectFlightIds = createSelector(selectFlightsState, flights => flights && flights.ids);
export const selectFlightEntities = createSelector(selectFlightsState, flights => flights && flights.entities);
export const selectRoutedFlight = createSelector(
  selectFlightEntities,
  selectRouterStateParams,
  (flights, params): FlightState => flights && params && flights[+params.flightId]
);
export const selectRoutedLocalFlight = createSelector(
  selectRoutedFlight,
  (flightState: FlightState): Flight => flightState && flightState.localFlight
);
export const selectRoutedFlightDoc = createSelector(
  selectRoutedFlight,
  (flightState: FlightState): HalDoc => flightState && flightState.doc
);
