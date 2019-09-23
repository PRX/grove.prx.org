import { AdvertiserService } from './advertiser.service';
import { MockHalService } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

describe('AdvertiserService', () => {
  let augury: MockHalService;
  let advertiser: AdvertiserService;

  beforeEach(() => {
    augury = new MockHalService();
    advertiser = new AdvertiserService(new AuguryService(augury as any));
  });

  it('lists advertisers', done => {
    const { id, name, href } = {
      id: 123,
      name: 'my name',
      href: '/all/by/my/self'
    };
    augury.mockItems('prx:advertisers', [{ id, name, _links: { self: { href } } }]);
    advertiser.listAdvertisers().subscribe(ads => {
      expect(ads.length).toEqual(1);
      expect(ads[0]).toMatchObject({
        id,
        name,
        self_uri: href
      });
      done();
    });
  });
});
