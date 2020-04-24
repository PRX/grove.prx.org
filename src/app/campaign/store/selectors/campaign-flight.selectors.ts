import { createSelector } from '@ngrx/store';
import { selectCampaign, selectCampaignLoaded, selectCampaignError } from './campaign.selectors';
import { selectAllFlights, selectFlightEntities, selectRoutedFlightId } from './flight.selectors';
import { CampaignState, FlightState, CampaignFormSave } from '../models';

export const selectCampaignWithFlightsForSave = createSelector(
  selectCampaign,
  selectAllFlights,
  (campaign: CampaignState, flights: FlightState[]): CampaignFormSave => ({
    campaign: campaign.localCampaign,
    campaignDoc: campaign.doc,
    updatedFlights: flights
      .filter(flight => !flight.softDeleted && flight.changed && flight.remoteFlight)
      .map(flight => flight.localFlight),
    createdFlights: flights.filter(flight => !flight.softDeleted && !flight.remoteFlight).map(flight => flight.localFlight),
    deletedFlights: flights.filter(flight => flight.softDeleted && flight.remoteFlight).map(flight => flight.localFlight),
    tempDeletedFlights: flights.filter(flight => flight.softDeleted && !flight.remoteFlight).map(flight => flight.localFlight)
  })
);

export const selectValid = createSelector(
  selectCampaign,
  selectAllFlights,
  (campaignState: CampaignState, flightsState: FlightState[]): boolean =>
    campaignState.valid && flightsState.every(flight => flight.valid || flight.softDeleted)
);

export const selectChanged = createSelector(
  selectCampaign,
  selectAllFlights,
  (campaignState: CampaignState, flightsState: FlightState[]): boolean =>
    campaignState.changed || flightsState.some(flight => flight.changed || flight.softDeleted)
);

export const selectFlightNotFoundError = createSelector(
  selectCampaignLoaded,
  selectRoutedFlightId,
  selectFlightEntities,
  (loaded, flightId, flights): string => loaded && flightId && !flights[flightId] && 'Flight Not Found'
);

export const selectError = createSelector(selectCampaignError, selectFlightNotFoundError, (campaignError: any, flightError: string) => {
  return (campaignError && campaignError.body && campaignError.body.message && 'Campaign ' + campaignError.body.message) || flightError;
});
