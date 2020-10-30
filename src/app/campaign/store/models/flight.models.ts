import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';
import { Moment, utc } from 'moment';
import { Creative } from './creative.models';

export interface FlightZone {
  id: string;
  label?: string;
  creativeFlightZones?: { creativeId?: number | string; weight?: number; disabled?: boolean }[];
}
export interface FlightTarget {
  type: string;
  code: string;
  label?: string;
  exclude?: boolean;
}

export interface Flight {
  id?: number;
  campaignId?: number;
  name: string;
  status: string;
  startAt: Moment;
  endAt: Moment;
  endAtFudged?: Moment;
  set_inventory_uri: string;
  zones: FlightZone[];
  targets?: FlightTarget[];
  totalGoal?: number;
  actualCount?: number;
  dailyMinimum?: number;
  velocity?: string;
  deliveryMode: string;
  allocationStatus?: string;
  allocationStatusMessage?: string;
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

export const getVelocity = (goal: number, min: number): string => {
  if (min && min >= goal) {
    return 'fastly';
  } else if (min) {
    return '';
  } else {
    return 'evenly';
  }
};

export const docToFlight = (doc: HalDoc): Flight => {
  let flight = filterUnderscores(doc) as Flight;
  const totalGoal = flight.hasOwnProperty('totalGoal') ? flight.totalGoal : null;
  const dailyMinimum = flight.hasOwnProperty('dailyMinimum') ? flight.dailyMinimum : null;
  const velocity = getVelocity(totalGoal, dailyMinimum);
  flight = {
    ...flight,
    campaignId: getCampaignId(doc),
    startAt: utc(flight.startAt),
    endAt: utc(flight.endAt),
    // the cutoff is midnight the following day, but want it to appear as if the flight ends on the date it is set to stop serving
    endAtFudged: utc(flight.endAt).subtract(1, 'days'),
    createdAt: new Date(flight.createdAt),
    set_inventory_uri: doc.expand('prx:inventory'),
    contractStartAt: flight.contractStartAt ? utc(flight.contractStartAt) : null,
    contractEndAt: flight.contractEndAt ? utc(flight.contractEndAt) : null,
    contractEndAtFudged: flight.contractEndAt ? utc(flight.contractEndAt).subtract(1, 'days') : null,
    // fields that are nullable are not present in the HalDoc
    // the Flight model needs to have these fields in order to set up the flight form that is re-used between flights
    totalGoal,
    dailyMinimum,
    velocity,
    contractGoal: flight.hasOwnProperty('contractGoal') ? flight.contractGoal : null,
    zones: flight.zones.map(({ id, label, creativeFlightZones }) => ({ id, label, creativeFlightZones }))
  };
  return flight;
};

export const duplicateFlightState = (flight: Flight, tempId: number, changed: boolean, valid: boolean): FlightState => {
  // remove createdAt
  const { createdAt, name, ...dupFlight } = flight;

  return {
    localFlight: {
      ...dupFlight,
      // set the temp id
      id: tempId,
      name: `Copy of ${name}`,
      // duplicated status becomes Draft
      status: 'draft',
      // clear all flight dates (dates must be present on flight model to reset form controls from the duplicated flight)
      startAt: undefined,
      endAt: undefined,
      endAtFudged: undefined,
      contractStartAt: undefined,
      contractEndAt: undefined,
      contractEndAtFudged: undefined
    } as Flight,
    changed,
    valid
  };
};

export const getFlightId = (state: FlightState) => {
  return state.localFlight && state.localFlight.id;
};

export const getCampaignId = (doc: HalDoc) => {
  if (doc && doc.has('prx:campaign')) {
    const id = doc
      .expand('prx:campaign')
      .split('/')
      .pop();
    return parseInt(id, 10) || null;
  } else {
    return null;
  }
};
