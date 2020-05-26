import { InventoryService, Inventory, filterZones, InventoryZone } from './inventory.service';
import { MockHalService } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { flightFixture } from '../../campaign/store/models/campaign-state.factory';

describe('InventoryService', () => {
  const augury = new MockHalService();
  const inventory = new InventoryService(new AuguryService(augury as any));
  const inventoryFixture: Inventory = {
    id: 1,
    podcastTitle: '88% Parentheticals',
    zones: [{ id: 'pre_1', label: 'Preroll 1' }],
    self_uri: '/some/inventory'
  };
  const availabilityFixture = {
    startDate: '2019-10-01',
    endDate: '2019-11-01',
    days: [
      { allocated: 0, availability: 1, date: '2019-10-01' },
      { allocated: 0, availability: 0, date: '2019-10-02' },
      { allocated: 0, availability: 9858, date: '2019-10-03' },
      { allocated: 0, availability: 5305, date: '2019-10-04' },
      { allocated: 0, availability: 2387, date: '2019-10-05' },
      { allocated: 0, availability: 1339, date: '2019-10-06' },
      { allocated: 0, availability: 709, date: '2019-10-07' },
      { allocated: 0, availability: 357, date: '2019-10-08' },
      { allocated: 0, availability: 158, date: '2019-10-09' },
      { allocated: 0, availability: 85, date: '2019-10-10' },
      { allocated: 0, availability: 48, date: '2019-10-11' },
      { allocated: 0, availability: 19, date: '2019-10-12' },
      { allocated: 0, availability: 8, date: '2019-10-13' },
      { allocated: 0, availability: 4, date: '2019-10-14' },
      { allocated: 0, availability: 1, date: '2019-10-15' },
      { allocated: 0, availability: 10812, date: '2019-10-16' },
      { allocated: 0, availability: 5299, date: '2019-10-17' },
      { allocated: 0, availability: 2527, date: '2019-10-18' },
      { allocated: 0, availability: 1393, date: '2019-10-20' },
      { allocated: 0, availability: 722, date: '2019-10-20' },
      { allocated: 0, availability: 430, date: '2019-10-21' },
      { allocated: 0, availability: 237, date: '2019-10-22' },
      { allocated: 0, availability: 97, date: '2019-10-23' },
      { allocated: 0, availability: 10333, date: '2019-10-24' },
      { allocated: 0, availability: 6174, date: '2019-10-25' },
      { allocated: 0, availability: 3567, date: '2019-10-26' },
      { allocated: 0, availability: 1691, date: '2019-10-27' },
      { allocated: 0, availability: 765, date: '2019-10-28' },
      { allocated: 0, availability: 403, date: '2019-10-29' },
      { allocated: 0, availability: 182, date: '2019-10-30' },
      { allocated: 0, availability: 91, date: '2019-10-31' }
    ]
  };

  beforeEach(() => {
    augury.mock('prx:inventory', inventoryFixture).mock('prx:availability', availabilityFixture);
  });

  it('gets inventory availability', done => {
    inventory
      .getInventoryAvailability({
        id: '1',
        startDate: '2019-10-01',
        endDate: '2019-11;01',
        zone: 'pre_1',
        flightId: 1
      })
      .subscribe(avail => {
        expect(avail['days'].length).toEqual(availabilityFixture.days.length);
        expect(avail['startDate']).toEqual(availabilityFixture.startDate);
        expect(avail['endDate']).toEqual(availabilityFixture.endDate);
        done();
      });
  });

  it('filters zone options based on the current zone', () => {
    const flightZones = flightFixture.zones.concat([{ id: 'post_1' }]) as InventoryZone[];
    const zoneOptions = [
      { id: 'pre_1', label: 'Preroll 1' },
      { id: 'pre_2', label: 'Preroll 2' },
      { id: 'post_1', label: 'Postroll 1' },
      { id: 'post_2', label: 'Postroll 2' }
    ];
    expect(filterZones(zoneOptions, flightZones).map(z => z.id)).toEqual(['pre_2', 'post_2']);
    expect(filterZones(zoneOptions, flightZones, 0).map(z => z.id)).toEqual(['pre_1', 'pre_2', 'post_2']);
    expect(filterZones(zoneOptions, flightZones, 1).map(z => z.id)).toEqual(['pre_2', 'post_1', 'post_2']);
  });
  it('defaults zone options to the current zone', () => {
    expect(filterZones(null, flightFixture.zones as InventoryZone[])).toEqual([]);
    expect(filterZones(null, flightFixture.zones as InventoryZone[], 0)).toEqual(flightFixture.zones);
  });
});
