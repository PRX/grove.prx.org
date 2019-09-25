import { AdvertiserService } from './advertiser.service';
import { MockHalService } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

describe('AdvertiserService', () => {
  let augury: MockHalService;
  let advertiserService: AdvertiserService;

  const { id, name, href } = {
    id: 123,
    name: 'my name',
    href: '/all/by/my/self'
  };

  beforeEach(() => {
    augury = new MockHalService();
    augury
      .mock('prx:advertisers', [{id, name, href}])
    advertiserService = new AdvertiserService(new AuguryService(augury as any));
  });

  it('lists advertisers', done => {
    augury.mockItems('prx:advertisers', [{ id, name, _links: { self: { href } } }]);
    advertiserService.loadAdvertisers();
    advertiserService.advertisers.subscribe(ads => {
      expect(ads.length).toEqual(1);
      expect(ads[0]).toMatchObject({
        id,
        name,
        set_advertiser_uri: href
      });
      done();
    });
  });
});
