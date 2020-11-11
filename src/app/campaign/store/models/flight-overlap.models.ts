import { Flight } from './flight.models';

export interface FlightOverlap {
  flightId: number;
  filters: string;
  overlapping: Flight[];
  loading?: boolean;
  error?: any;
}

export const overlapFilters = (flight: Flight): string => {
  if (flight && flight.set_inventory_uri && flight.zones && flight.zones.length && flight.endAt && flight.startAt) {
    const endAtInclusive = flight.endAt.clone().subtract(1, 'millisecond');
    return [
      `inventory=${flight.set_inventory_uri.split('/').pop()}`,
      `zone=${flight.zones.map(z => z.id).join(',')}`,
      `before=${endAtInclusive.toISOString()}`,
      `after=${flight.startAt.toISOString()}`
    ].join(',');
  } else {
    return null;
  }
};
