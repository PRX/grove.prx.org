import { flightStatusOptions } from './flight-status.models';

describe('FlightStatusModels', () => {
  it('returns valid status options', () => {
    const opts = flightStatusOptions('approved');
    expect(opts.length).toEqual(4);
    expect(opts).toContainEqual({ name: 'Approved', value: 'approved' });
    expect(opts).toContainEqual({ name: 'Paused', value: 'paused' });
    expect(opts).toContainEqual({ name: 'Canceled', value: 'canceled' });
    expect(opts).toContainEqual({ name: 'Completed', value: 'completed' });
  });

  it('returns default status options', () => {
    const opts = flightStatusOptions(null);
    expect(opts.length).toEqual(4);
    expect(opts).toContainEqual({ name: 'Draft', value: 'draft' });
    expect(opts).toContainEqual({ name: 'Hold', value: 'hold' });
    expect(opts).toContainEqual({ name: 'Sold', value: 'sold' });
    expect(opts).toContainEqual({ name: 'Approved', value: 'approved' });
  });

  it('always returns the option you pass in', () => {
    const opts1 = flightStatusOptions('canceled');
    expect(opts1.length).toEqual(1);
    expect(opts1).toContainEqual({ name: 'Canceled', value: 'canceled' });

    const opts2 = flightStatusOptions('anything');
    expect(opts2.length).toEqual(1);
    expect(opts2).toContainEqual({ name: 'Anything', value: 'anything' });
  });
});
