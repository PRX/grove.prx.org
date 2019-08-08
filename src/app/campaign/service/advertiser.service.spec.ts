import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdvertiserService } from './advertiser.service';
import { MockHalService, HalService } from 'ngx-prx-styleguide';
import { AuguryService } from '../../core/augury.service';
import { AdvertiserServiceMock } from './advertiser.service.mock';
import { AdvertiserModel } from '../../shared/model/advertiser.model';

describe('AdvertiserService', () => {
  let auguryService;
  let advertiserService;
  let httpTestingController;
  const mockHal = new MockHalService();
  const advertiserMock = new AdvertiserServiceMock(mockHal);
  let mockAdvertisers: AdvertiserModel[];

  advertiserMock.advertisers.subscribe(advertisers => {
    mockAdvertisers = advertisers;
    mockHal.mockItems('prx:advertisers', advertisers.map(a => a.doc));
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuguryService,
        AdvertiserService,
        {
          provide: HalService,
          useValue: mockHal
        }
      ],
      imports: [HttpClientTestingModule]
    });

    // We inject our service (which imports the HttpClient) and the Test Controller
    httpTestingController = TestBed.get(HttpTestingController);
    auguryService = TestBed.get(AuguryService);
    advertiserService = TestBed.get(AdvertiserService);
  });

  it ('load advertisers', (done) => {
    advertiserService.advertisers.subscribe(advertisers => {
      expect(advertisers.length).toBe(mockAdvertisers.length);
      done();
    });
  });
});
