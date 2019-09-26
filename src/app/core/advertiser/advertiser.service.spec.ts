import { AdvertiserService } from './advertiser.service';
import { MockHalService } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { withLatestFrom } from 'rxjs/operators';

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
    augury.mockItems('prx:advertisers', [{ id, name, _links: { self: { href } } }]);
    advertiserService = new AdvertiserService(new AuguryService(augury as any));
  });

  it('lists advertisers', done => {
    advertiserService.loadAdvertisers();
    advertiserService.advertisers.subscribe(advertisers => {
      expect(advertisers.length).toEqual(1);
      expect(advertisers[0]).toMatchObject({
        id,
        name,
        set_advertiser_uri: href
      });
      done();
    });
  });

  it('finds advertisers by URI', done => {
    advertiserService.findAdvertiserByUri('/all/by/my/self').subscribe(advertiser => {
      expect(advertiser).toMatchObject({
        id,
        name,
        set_advertiser_uri: href
      });
      done();
    });
  });

  it('adds an advertiser', done => {
    advertiserService.addAdvertiser('Hi Friend!').subscribe(
       (newAdvertiser) => {
         expect(newAdvertiser.name).toEqual('Hi Friend!');
       },
      () => {},
      () => {
        advertiserService.advertisers.subscribe(advertisers => {
          expect(advertisers.find(a => a.name === 'Hi Friend!')).toBeDefined();
          done();
        });
      }
    );
  });
});
