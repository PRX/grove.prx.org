import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';
import { Moment, utc } from 'moment';

export interface FlightZone {
  id: string;
  label?: string;
  url?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface FlightTarget {
  type: string;
  code: string;
  label?: string;
  exclude?: boolean;
}

export interface Flight {
  id?: number;
  name: string;
  startAt: Moment;
  endAt: Moment;
  endAtFudged?: Moment;
  set_inventory_uri: string;
  zones: FlightZone[];
  targets?: FlightTarget[];
  totalGoal?: number;
  actualCount?: number;
  dailyMinimum?: number;
  deliveryMode: string;
  status?: string;
  statusMessage?: string;
  createdAt?: Date;
  contractGoal?: number;
  contractStartAt?: Moment;
  contractEndAt?: Moment;
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
  flight.startAt = utc(flight.startAt);
  flight.endAt = utc(flight.endAt);
  // the cutoff is midnight the following day, but want it to appear as if the flight ends on the date it is set to stop serving
  flight.endAtFudged = utc(flight.endAt).subtract(1, 'days');
  flight.createdAt = new Date(flight.createdAt);
  flight.set_inventory_uri = doc.expand('prx:inventory');
  flight.contractStartAt = flight.contractStartAt ? utc(flight.contractStartAt) : null;
  flight.contractEndAt = flight.contractEndAt ? utc(flight.contractEndAt) : null;
  return flight;
};

export const duplicateFlightState = (flight: Flight, tempId: number, changed: boolean, valid: boolean): FlightState => {
  // remove createdAt, startAt, endAt, and set temp id
  const { createdAt, startAt, endAt, name, ...dupFlight } = flight;

  return {
    localFlight: {
      ...dupFlight,
      id: tempId,
      name: `Copy of ${name}`
    } as Flight,
    changed,
    valid
  };
};

export const getFlightId = (state: FlightState) => {
  return state.localFlight && state.localFlight.id;
};
