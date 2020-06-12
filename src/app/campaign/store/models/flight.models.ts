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

export interface Flight {
  id?: number;
  name: string;
  startAt: Moment;
  endAt: Moment;
  set_inventory_uri: string;
  zones: FlightZone[];
  totalGoal: number;
  actualCount?: number;
  dailyMinimum?: number;
  uncapped?: boolean;
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
  flight.createdAt = new Date(flight.createdAt);
  flight.set_inventory_uri = doc.expand('prx:inventory');
  flight.contractStartAt = flight.contractStartAt ? utc(flight.contractStartAt) : null;
  flight.contractEndAt = flight.contractEndAt ? utc(flight.contractEndAt) : null;
  return flight;
};

export const getFlightZoneIds = (zones: any[]): string[] => {
  return zones.filter(z => z).map(z => z.id || z);
};

export const duplicateFlightState = (flight: Flight, tempId: number, changed, valid): FlightState => {
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

export const isNameChanged = ({ name: compare }: { name: string }, { name: base }: { name: string }) => compare !== base;
export const isInventoryChanged = (
  { set_inventory_uri: compare }: { set_inventory_uri: string },
  { set_inventory_uri: base }: { set_inventory_uri: string }
) => compare !== base;
const dateValue = (date: Moment) => date && date.valueOf();
export const isStartAtChanged = ({ startAt: compare }: { startAt: Moment }, { startAt: base }: { startAt: Moment }) =>
  dateValue(compare) !== dateValue(base);
export const isEndAtChanged = ({ endAt: compare }: { endAt: Moment }, { endAt: base }: { endAt: Moment }) =>
  dateValue(compare) !== dateValue(base);
export const isZonesChanged = ({ zones: compare }: { zones: FlightZone[] }, { zones: base }: { zones: FlightZone[] }): boolean => {
  const zonesToString = (zs: FlightZone[]) =>
    zs &&
    zs.length &&
    zs
      .map(z => `${z.id}${z.url || ''}`)
      .sort((a, b) => a.localeCompare(b))
      .join(',');
  return zonesToString(compare) !== zonesToString(base);
};
