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
  totalGoal: number;
  zones: FlightZone[];
  status?: string;
  status_message?: string;
  createdAt?: Date;
  set_inventory_uri: string;
}

export interface FlightState {
  id: number;
  doc?: HalDoc;
  localFlight: Flight;
  remoteFlight?: Flight;
  dailyMinimum?: number;
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
