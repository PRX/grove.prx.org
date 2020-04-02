import { AdvertiserService } from './advertiser.service';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

describe('AdvertiserService', () => {
  const { id, name, href } = {
    id: 123,
    name: 'my name',
    href: '/all/by/my/self'
  };
  const advertiser = { id, name, _links: { self: { href } } };
  const augury = new MockHalService();
  const advertiserService = new AdvertiserService(new AuguryService(augury as any));
  const advertiserDocs = augury.mockItems('prx:advertisers', [advertiser]);

  it('lists advertisers', done => {
    advertiserService.loadAdvertisers().subscribe(advertisers => {
      expect(advertisers.length).toEqual(1);
      expect(advertisers).toEqual(advertiserDocs);
      done();
    });
  });

  it('adds an advertiser', done => {
    advertiserService.addAdvertiser('Hi Friend!').subscribe(newAdvertiser => {
      expect(newAdvertiser['name']).toEqual('Hi Friend!');
      done();
    });
  });
});
