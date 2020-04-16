import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';

export interface FlightZone {
  id: string;
  label?: string;
  url?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface Flight {
  id?: number;
  name: string;
  startAt: Date;
  endAt: Date;
  set_inventory_uri: string;
  zones: FlightZone[];
  totalGoal: number;
  dailyMinimum?: number;
  status?: string;
  status_message?: string;
  createdAt?: Date;
}

export interface FlightState {
  doc?: HalDoc;
  localFlight: Flight;
  remoteFlight?: Flight;
  changed: boolean;
  valid: boolean;
  softDeleted?: boolean;
}

export const docToFlight = (doc: HalDoc): Flight => {
  const flight = filterUnderscores(doc) as Flight;
  flight.startAt = new Date(flight.startAt);
  flight.endAt = new Date(flight.endAt);
  flight.createdAt = new Date(flight.createdAt);
  flight.set_inventory_uri = doc.expand('prx:inventory');
  return flight;
};

export const getFlightZoneIds = (zones: any[]): string[] => {
  return zones.filter(z => z).map(z => z.id || z);
};

export const duplicateFlight = (flight: Flight, tempId: number): Flight => {
  // remove createdAt, startAt, endAt and set temp id
  const { createdAt, startAt, endAt, ...dupFlight } = flight;
  dupFlight.id = tempId;
  return dupFlight as Flight;
};

export const getFlightId = (state: FlightState) => {
  return state.localFlight && state.localFlight.id;
};
