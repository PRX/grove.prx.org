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
  contractEndAtFudged?: Moment;
  isCompanion?: boolean;
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
  let flight = filterUnderscores(doc) as Flight;
  flight = {
    ...flight,
    startAt: utc(flight.startAt),
    endAt: utc(flight.endAt),
    // the cutoff is midnight the following day, but want it to appear as if the flight ends on the date it is set to stop serving
    endAtFudged: utc(flight.endAt).subtract(1, 'days'),
    createdAt: new Date(flight.createdAt),
    set_inventory_uri: doc.expand('prx:inventory'),
    ...(flight.contractStartAt && { contractStartAt: utc(flight.contractStartAt) }),
    ...(flight.contractEndAt && { contractEndAt: utc(flight.contractEndAt) }),
    ...(flight.contractEndAt && { contractEndAtFudged: utc(flight.contractEndAt).subtract(1, 'days') })
  };
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
