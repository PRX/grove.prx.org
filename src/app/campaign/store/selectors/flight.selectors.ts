import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '../';
import { selectCampaignStoreState } from './campaign.selectors';
import { selectRouterStateParams } from '../../../store/router-store/router.selectors';
import { Flight, FlightState } from '../models';
import { selectIds, selectEntities, selectAll } from '../reducers/flight.reducer';
import { HalDoc } from 'ngx-prx-styleguide';

export const selectFlightsState = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.flights);
export const selectFlightIds = createSelector(selectFlightsState, selectIds);
export const selectFlightEntities = createSelector(selectFlightsState, selectEntities);
export const selectAllFlights = createSelector(selectFlightsState, selectAll);

export const selectAllFlightsOrderByCreatedAt = createSelector(selectAllFlights, flights =>
  flights.sort((a, b) => (a.localFlight.createdAt || a.localFlight.id).valueOf() - (b.localFlight.createdAt || b.localFlight.id).valueOf())
);

export const selectRoutedFlightId = createSelector(selectRouterStateParams, (params): number => params && +params.flightId);
export const selectRoutedFlight = createSelector(
  selectFlightEntities,
  selectRoutedFlightId,
  (flights, id): FlightState => flights && flights[id]
);

export const selectRoutedLocalFlight = createSelector(
  selectRoutedFlight,
  (flightState: FlightState): Flight => flightState && flightState.localFlight
);
export const selectRoutedLocalFlightZones = createSelector(
  selectRoutedLocalFlight,
  (flight: Flight): string[] => flight && flight.zones && flight.zones.map(z => z.id)
);
export const selectCurrentInventoryUri = createSelector(
  selectRoutedLocalFlight,
  (flight: Flight): string => flight && flight.set_inventory_uri
);
export const selectRoutedFlightDeleted = createSelector(
  selectRoutedFlight,
  (flightState: FlightState): boolean => flightState && flightState.softDeleted
);
export const selectRoutedFlightChanged = createSelector(
  selectRoutedFlight,
  (flightState: FlightState): boolean => flightState && flightState.changed
);
export const selectFlightDocById = createSelector(
  selectFlightEntities,
  (flights: { [id: number]: FlightState }, props: { id: number }): HalDoc => flights && flights[props.id].doc
);
