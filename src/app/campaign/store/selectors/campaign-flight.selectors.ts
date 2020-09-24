import { createSelector } from '@ngrx/store';
import { Dictionary } from '@ngrx/entity';
import { selectAllAdvertisers } from './advertiser.selectors';
import { selectCampaign, selectCampaignLoaded, selectCampaignError, selectLocalCampaign } from './campaign.selectors';
import {
  selectAllFlights,
  selectFlightEntities,
  selectRoutedFlightId,
  selectRoutedFlight,
  selectAllLocalFlights,
  selectRemoteFlightsOrderByContractStartAt
} from './flight.selectors';
import { selectFlightDaysEntities } from './flight-days.selectors';
import { selectAllInventory } from './inventory.selectors';
import { Advertiser, Campaign, CampaignState, Flight, FlightState, CampaignFormSave, FlightDay, FlightDays, Inventory } from '../models';
import { GeoTargetsPipe } from '../../../shared/pipes/geo-targets.pipe';
import { utc } from 'moment';

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

export const selectCampaignAndFlights = createSelector(
  selectLocalCampaign,
  selectAllLocalFlights,
  (campaign: Campaign, flights: Flight[]) => ({
    campaign,
    flights
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

export const selectError = createSelector(
  selectCampaignError,
  selectFlightNotFoundError,
  (campaignError: any, flightNotFoundError: string) => {
    return campaignError && campaignError.body && campaignError.body.message;
  }
);

export const selectRoutedCampaignFlightDocs = createSelector(
  selectCampaign,
  selectRoutedFlight,
  (campaign: CampaignState, flight: FlightState) => {
    return { campaignDoc: campaign.doc, flightDoc: flight.doc };
  }
);

export const selectCampaignFlightInventoryReportData = createSelector(
  selectCampaign,
  selectAllInventory,
  selectAllAdvertisers,
  selectRemoteFlightsOrderByContractStartAt,
  selectFlightDaysEntities,
  (campaign: CampaignState, shows: Inventory[], advertisers: Advertiser[], flights: Flight[], inventory: Dictionary<FlightDays>) => {
    // Flight Names
    const reportData: any[][] = [['Flight Name'].concat(flights.map(flight => flight.name))];
    // Show
    reportData.push(
      ['Show'].concat(
        flights.map(flight => {
          const show = shows.find(i => i.self_uri === flight.set_inventory_uri);
          return show ? show.podcastTitle : '';
        })
      )
    );
    // Advertiser/Sponsor
    reportData.push(
      ['Sponsor'].concat(
        flights.map(_ => {
          const advertiser = advertisers.find(a => a.set_advertiser_uri === campaign.remoteCampaign.set_advertiser_uri);
          return advertiser ? advertiser.name : '';
        })
      )
    );
    // Zones
    reportData.push(['Zones'].concat(flights.map(flight => flight.zones.map(zone => zone.label).join(', '))));
    // Contract Start and End Dates, fall back to Actual Start and/or End Dates if null
    reportData.push(
      ['Start Date'].concat(
        flights.map(flight => {
          const flightStartAt = flight.contractStartAt ? flight.contractStartAt : flight.startAt;
          return flightStartAt ? flightStartAt.format('MM-DD-YYYY') : '';
        })
      )
    );
    reportData.push(
      ['End Date'].concat(
        flights.map(flight => {
          const flightEndAt = flight.contractEndAtFudged ? flight.contractEndAtFudged : flight.endAtFudged;
          return flightEndAt ? flightEndAt.format('MM-DD-YYYY') : '';
        })
      )
    );
    // Geo Targets
    const geoTransform = new GeoTargetsPipe();
    reportData.push(
      ['Geotarget'].concat(
        flights.map(flight =>
          flight.targets
            .map(t => geoTransform.transform(t))
            .filter(t => t)
            .join(', ')
        )
      )
    );
    // Contract Goal, falls back to totalGoal if null
    reportData.push(
      (['Contract Goal'] as (string | number)[]).concat(
        flights.map(flight => (flight.contractGoal ? flight.contractGoal : flight.totalGoal))
      )
    );
    // Actuals
    reportData.push((['Total Delivered'] as (string | number)[]).concat(flights.map(flight => flight.actualCount)));
    // Inventory Days for each flight mapped by date
    const inventoryDays = flights.reduce(
      (days, flight) =>
        inventory[flight.id].days.reduce((acc, day) => {
          const date = day.date.valueOf();
          acc[date] = {
            ...acc[date],
            [flight.id]: day
          };
          return acc;
        }, days),
      {} as { [date: number]: { [flightId: number]: FlightDay } }
    );
    // push each inventory date row
    // if no data for flight on date, show '-'
    Object.keys(inventoryDays)
      .sort((a, b) => +a - +b)
      .forEach(date =>
        reportData.push(
          ([utc(+date).format('MM-DD-YYYY')] as (string | number)[]).concat(
            flights.map(flight => (inventoryDays[date][flight.id] ? inventoryDays[date][flight.id].numbers.actuals : '-'))
          )
        )
      );
    return reportData;
  }
);
