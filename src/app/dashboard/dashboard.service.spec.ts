import { TestBed } from '@angular/core/testing';
import { MockHalService, HalService } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';
import { DashboardService } from './dashboard.service';
import { campaigns as campaignsFixture, flights as flightsFixture, facets } from './dashboard.service.mock';

describe('DashboardService', () => {
  let auguryService: AuguryService;
  let campaignListService: DashboardService;
  const mockHalService = new MockHalService();

  const mockCampaignsResponse = mockHalService.mock('prx:campaigns', {
    total: campaignsFixture.length,
    count: campaignsFixture.length,
    facets
  });
  const mockCampaigns = mockCampaignsResponse.mockList('prx:items', campaignsFixture);
  mockCampaigns.forEach(campaign => {
    campaign.mock('prx:advertiser', campaign['advertiser']);
    campaign.mockItems('prx:flights', flightsFixture);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuguryService,
        DashboardService,
        {
          provide: HalService,
          useValue: mockHalService
        }
      ]
    });

    auguryService = TestBed.get(AuguryService);
    campaignListService = TestBed.get(DashboardService);
    campaignListService.loadCampaignList();
  });

  it('should load campaign list', done => {
    campaignListService.campaigns.subscribe(campaigns => {
      expect(campaigns.length).toEqual(campaignsFixture.length);
      expect(campaigns[0].name).toEqual(campaignsFixture[0].name);
      done();
    });
  });

  it('gets loaded campaigns', done => {
    campaignListService.loadedCampaigns.subscribe(loadedCampaigns => {
      expect(loadedCampaigns.length).toEqual(campaignsFixture.filter(c => !c.loading).length);
      done();
    });
  });

  it('gets loading', done => {
    campaignListService.loading.subscribe(loading => {
      expect(loading.length).toEqual(campaignsFixture.filter(c => c.loading).length);
      done();
    });
  });

  it('should build filters for API request', () => {
    expect(
      campaignListService.getFilters({
        type: 'house',
        geo: ['US', 'CA'],
        zone: ['mid_1', 'pre_1'],
        representative: 'Mich'
      })
    ).toEqual('type=house,geo=US,CA,zone=mid_1,pre_1,representative=Mich');
    const before = new Date();
    const after = new Date();
    expect(
      campaignListService.getFilters({
        advertiser: 3,
        podcast: 2,
        status: 'approved',
        before,
        after
      })
    ).toEqual(`advertiser=3,podcast=2,status=approved,before=${before.toISOString()},after=${after.toISOString()}`);
  });

  it('should build router query params', () => {
    const before = new Date('2019-10-31');
    const after = new Date('2019-10-01');
    expect(
      campaignListService.getRouteQueryParams({
        page: 2,
        geo: ['US', 'CA'],
        zone: ['pre_1', 'house_pre_1'],
        before,
        after
      })
    ).toMatchObject({ after: after.toISOString(), before: before.toISOString(), geo: 'US|CA', page: 2, zone: 'pre_1|house_pre_1' });
  });

  it('should handle errors on load', done => {
    mockHalService.mockError('prx:campaigns', 'Bad Request');
    campaignListService.loadCampaignList();
    campaignListService.campaigns.subscribe(campaigns => {
      expect(campaignListService.error).toEqual(new Error('Bad Request'));
      done();
    });
  });
});
