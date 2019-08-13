import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdvertiserService } from './advertiser.service';
import { MockHalService, HalService, MockHalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../../core/augury.service';
import { AdvertiserServiceMock } from './advertiser.service.mock';
import { AdvertiserModel } from '../../shared/model/advertiser.model';
import { withLatestFrom } from 'rxjs/operators';

describe('AdvertiserService', () => {
  let auguryService: AuguryService;
  let advertiserService: AdvertiserService;
  const mockAuguryService = new MockHalService();
  const advertiserMock = new AdvertiserServiceMock(mockAuguryService);
  let mockAdvertisers: AdvertiserModel[];

  advertiserMock.advertisers.subscribe(advertisers => {
    mockAdvertisers = advertisers;
    mockAuguryService.mockItems('prx:advertisers', advertisers.map(a => a.doc));
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuguryService,
        AdvertiserService,
        {
          provide: HalService,
          useValue: mockAuguryService
        }
      ],
      imports: [HttpClientTestingModule]
    });

    auguryService = TestBed.get(AuguryService);
    advertiserService = TestBed.get(AdvertiserService);
  });

  it('should load advertisers', (done) => {
    advertiserService.advertisers.subscribe(advertisers => {
      expect(advertisers.length).toEqual(mockAdvertisers.length);
      expect(advertisers[0].name).toEqual(mockAdvertisers[0].name);
      done();
    });
  });

  it('should find an advertiser by id', (done) => {
    advertiserService.findAdvertiserById(1).subscribe(advertiser => {
      expect(advertiser.name).toEqual(mockAdvertisers.find(c => c.id === 1).name);
      done();
    });
  });

  it('should save new advertiser records', (done) => {
    const newAdvertiser = new AdvertiserModel(mockAuguryService.root, new MockHalDoc({id: 4, name: 'Webby Nomination'}));
    advertiserService.save(newAdvertiser).pipe(
      withLatestFrom(advertiserService.advertisers)
    ).subscribe(([, advertisers]) => {
      expect(advertisers.find(a => a.id === 4)).toEqual(newAdvertiser);
      done();
    });
  });

  it('should save changes to existing records', (done) => {
    const updatedAdvertiser = new AdvertiserModel(mockAuguryService.root, new MockHalDoc({id: 3, name: 'ZigZag'}));
    advertiserService.save(updatedAdvertiser).pipe(
      withLatestFrom(advertiserService.advertisers)
    ).subscribe(([, advertisers]) => {
      expect(advertisers.find(a => a.id === 3)).toEqual(updatedAdvertiser);
      done();
    });
  });

  it('should handle errors on load', (done) => {
    mockAuguryService.mockError('prx:advertisers', 'Bad Request');
    advertiserService.loadAdvertisers();
    advertiserService.advertisers.subscribe((advertisers) => {
      expect(advertisers.length).toEqual(mockAdvertisers.length);
      expect(advertiserService.error).toEqual(new Error('Bad Request'));
      done();
    });
  });
});
