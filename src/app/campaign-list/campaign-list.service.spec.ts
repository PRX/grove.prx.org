import { TestBed } from '@angular/core/testing';
import { MockHalService, HalService, MockHalDoc, HalObservable } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';
import { CampaignListService } from './campaign-list.service';
import { campaigns as campaignsFixture, flights as flightsFixture } from './campaign-list.service.mock';

describe('CampaignListService', () => {
  let auguryService: AuguryService;
  let campaignListService: CampaignListService;
  const mockAuguryService = new MockHalService();

  const mockCampaigns = mockAuguryService.mockItems('prx:campaigns', campaignsFixture);
  mockCampaigns.forEach(campaign => {
    campaign.mockItems('prx:flights', flightsFixture);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuguryService,
        CampaignListService,
        {
          provide: HalService,
          useValue: mockAuguryService
        }
      ],
    });

    auguryService = TestBed.get(AuguryService);
    campaignListService = TestBed.get(CampaignListService);
  });

  it('should load campaign list', (done) => {
    campaignListService.campaigns.subscribe(campaigns => {
      expect(campaigns.length).toEqual(campaignsFixture.length);
      expect(campaigns[0].name).toEqual(campaignsFixture[0].name);
      done();
    });
  });

  it('should handle errors on load', (done) => {
    mockAuguryService.mockError('prx:campaigns', 'Bad Request');
    campaignListService.loadCampaignList();
    campaignListService.campaigns.subscribe((campaigns) => {
      expect(campaigns.length).toEqual(mockCampaigns.length);
      expect(campaignListService.error).toEqual(new Error('Bad Request'));
      done();
    });
  });
});
