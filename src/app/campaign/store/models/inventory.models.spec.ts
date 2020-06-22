import { InventoryZone, docToInventory, docToInventoryTargets, filterZones } from './inventory.models';
import { MockHalDoc } from 'ngx-prx-styleguide';

describe('InventoryModels', () => {
  it('transforms haldocs to inventory', () => {
    const doc = new MockHalDoc({ id: 1, podcastTitle: 'title1', what: 'ever', _links: { self: { href: 'href1' } } });
    expect(docToInventory(doc)).toMatchObject({
      id: 1,
      podcastTitle: 'title1',
      what: 'ever',
      self_uri: 'href1'
    });
  });

  it('transforms a haldoc to an inventory targets', () => {
    const doc = new MockHalDoc({ inventoryId: 1, episodes: [{ type: 'episode', label: 'episode1', code: 'ep1' }] });
    expect(docToInventoryTargets(doc)).toMatchObject({
      inventoryId: 1,
      episodes: [{ type: 'episode', label: 'episode1', code: 'ep1' }]
    });
  });

  it('filters zone options based on the current zone', () => {
    const zones = [{ id: 'pre_1' }, { id: 'post_1' }] as InventoryZone[];
    const options = [
      { id: 'pre_1', label: 'Preroll 1' },
      { id: 'pre_2', label: 'Preroll 2' },
      { id: 'post_1', label: 'Postroll 1' },
      { id: 'post_2', label: 'Postroll 2' }
    ];
    expect(filterZones(options, zones).map(z => z.id)).toEqual(['pre_2', 'post_2']);
    expect(filterZones(options, zones, 0).map(z => z.id)).toEqual(['pre_1', 'pre_2', 'post_2']);
    expect(filterZones(options, zones, 1).map(z => z.id)).toEqual(['pre_2', 'post_1', 'post_2']);
  });

  it('defaults zone options to the current zone', () => {
    const zones = [{ id: 'pre_1', label: 'Preroll 1' }] as InventoryZone[];
    expect(filterZones(null, zones)).toEqual([]);
    expect(filterZones(null, zones, 0)).toEqual([{ id: 'pre_1', label: 'Preroll 1' }]);
  });
});
