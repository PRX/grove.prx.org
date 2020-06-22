import { InventoryService } from './inventory.service';
import { MockHalService } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

describe('InventoryService', () => {
  const augury = new MockHalService();
  const service = new InventoryService(new AuguryService(augury as any));

  it('lists inventory', done => {
    const invs = [
      { id: 1, podcastTitle: 'title 1' },
      { id: 2, podcastTitle: 'title 2' },
      { id: 3, podcastTitle: 'title 3' }
    ];

    augury.mockItems('prx:inventory', invs);

    service.loadInventory().subscribe(inventory => {
      expect(inventory.length).toEqual(3);
      expect(inventory[0]).toMatchObject(invs[0]);
      expect(inventory[1]).toMatchObject(invs[1]);
      expect(inventory[2]).toMatchObject(invs[2]);
      done();
    });
  });

  it('shows inventory targets', done => {
    const targets = {
      inventoryId: 999,
      episodes: [{ type: 'episode', label: 'Episode 1', code: 'ep1' }],
      countries: [{ type: 'country', label: 'Canadia', code: 'CA' }]
    };

    augury.mock('prx:inventory', {}).mock('prx:targets', targets);

    service.loadInventoryTargets(999).subscribe(inventory => {
      expect(inventory).toMatchObject(targets);
      done();
    });
  });
});
