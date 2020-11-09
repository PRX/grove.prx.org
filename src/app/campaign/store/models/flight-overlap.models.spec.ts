import { Flight } from './flight.models';
import { overlapFilters } from './flight-overlap.models';
import moment from 'moment';

describe('FlightOverlapModels', () => {
  const flight: Flight = {
    name: 'myflight',
    status: 'hold',
    deliveryMode: 'capped',
    startAt: moment.utc('2020-01-01'),
    endAt: moment.utc('2020-02-01'),
    set_inventory_uri: 'http://augury/api/v1/inventory/1',
    zones: [{ id: 'pre_1' }]
  };

  it('requires flight params', () => {
    expect(overlapFilters({} as Flight)).toBeNull();
    expect(overlapFilters({ ...flight, startAt: null } as Flight)).toBeNull();
    expect(overlapFilters({ ...flight, endAt: null } as Flight)).toBeNull();
    expect(overlapFilters({ ...flight, set_inventory_uri: null } as Flight)).toBeNull();
    expect(overlapFilters({ ...flight, zones: [] } as Flight)).toBeNull();
  });

  it('generates a filter string', () => {
    expect(overlapFilters(flight)).toEqual('inventory=1,zones=pre_1,before=2020-01-31T23:59:59.999Z,after=2020-01-01T00:00:00.000Z');
  });
});
