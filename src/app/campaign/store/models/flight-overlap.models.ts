import { Flight } from './flight.models';

export interface FlightOverlap {
  flightId: number;
  filters: string;
  overlapping: Flight[];
  loading?: boolean;
  error?: any;
}

export const overlapFilters = (flight: Flight): string => {
  if (flight.set_inventory_uri && flight.zones && flight.zones.length && flight.endAt && flight.startAt) {
    return [
      `inventory=${flight.set_inventory_uri.split('/').pop()}`,
      `zones=${flight.zones.map(z => z.id).join(',')}`,
      `before=${flight.endAt.toISOString()}`,
      `after=${flight.startAt.toISOString()}`
    ].join(',');
  } else {
    return null;
  }
};
