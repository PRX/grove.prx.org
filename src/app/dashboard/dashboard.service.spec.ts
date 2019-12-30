import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { MockHalService, HalService } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';
import { DashboardService, Campaign } from './dashboard.service';
import { campaigns as campaignsFixture, flights as flightsFixture, facets } from './dashboard.service.mock';
import { withLatestFrom } from 'rxjs/operators';

@Component({ template: `` })
export class FlightTableComponent {}
@Component({ template: `` })
export class CampaignListComponent {}

describe('DashboardService', () => {
  const mockHalService = new MockHalService();
  let auguryService: AuguryService;
  let router: Router;
  let dashboardService: DashboardService;

  mockHalService
    .mock('prx:campaigns', {
      total: campaignsFixture.length,
      count: campaignsFixture.length,
      facets
    })
    .mockList('prx:items', campaignsFixture)
    .forEach(campaign => {
      campaign.mock('prx:advertiser', campaign['advertiser']);
      campaign.mockItems('prx:flights', flightsFixture);
    });
  mockHalService
    .mock('prx:flights', {
      total: flightsFixture.length,
      count: flightsFixture.length,
      facets
    })
    .mockList('prx:items', flightsFixture)
    .forEach(flight => {
      flight.mock('prx:advertiser', campaignsFixture[0]['advertiser']);
      flight.mock('prx:campaign', campaignsFixture[0]);
    });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CampaignListComponent, FlightTableComponent],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'campaigns', component: CampaignListComponent },
          { path: 'flights', component: FlightTableComponent }
        ])
      ],
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
    router = TestBed.get(Router);
    dashboardService = TestBed.get(DashboardService);
    dashboardService.loadCampaignList();
    dashboardService.loadFlightList();
  });

  it('should load campaign list', done => {
    dashboardService.campaigns.subscribe(campaigns => {
      expect(campaigns.length).toEqual(campaignsFixture.length);
      expect(campaigns[0].name).toEqual(campaignsFixture[0].name);
      done();
    });
  });

  it('gets loaded campaigns', done => {
    dashboardService.loadedCampaigns.subscribe(loadedCampaigns => {
      expect(loadedCampaigns.length).toEqual(campaignsFixture.filter(c => !c.loading).length);
      done();
    });
  });

  it('gets campaign loading status', done => {
    dashboardService.campaignLoading.subscribe(loading => {
      expect(loading.length).toEqual(campaignsFixture.filter(c => c.loading).length);
      done();
    });
  });

  it('should load flight list', done => {
    dashboardService.flights.subscribe(flights => {
      expect(flights.length).toEqual(flightsFixture.length);
      expect(flights[0].name).toEqual(flightsFixture[0].name);
      done();
    });
  });

  it('gets flight loading status', done => {
    dashboardService.flightsLoading.subscribe(loading => {
      expect(loading).toBeFalsy();
      done();
    });
  });

  it('should build filters for API request', () => {
    expect(
      dashboardService.getFilters({
        type: 'house',
        geo: ['US', 'CA'],
        zone: ['mid_1', 'pre_1'],
        representative: 'Mich'
      })
    ).toEqual('type=house,geo=US,CA,zone=mid_1,pre_1,representative=Mich');
    const before = new Date();
    const after = new Date();
    expect(
      dashboardService.getFilters({
        advertiser: 3,
        podcast: 2,
        status: 'approved',
        before,
        after
      })
    ).toEqual(`advertiser=3,podcast=2,status=approved,before=${before.toISOString()},after=${after.toISOString()}`);
  });

  it('should build router params', done => {
    const before = new Date('2019-10-31');
    const after = new Date('2019-10-01');
    dashboardService
      .getRouteParams({
        page: 2,
        geo: ['US', 'CA'],
        zone: ['pre_1', 'house_pre_1'],
        before,
        after
      })
      .subscribe(params => {
        expect(params).toMatchObject({
          after: after.toISOString(),
          before: before.toISOString(),
          geo: 'US|CA',
          page: 2,
          zone: 'pre_1|house_pre_1'
        });
        done();
      });
  });

  it('should build router params from existing and given params', done => {
    dashboardService.setParamsFromRoute({ page: 1, sort: 'start_at', direction: 'asc' }, 'flights');
    dashboardService
      .getRouteParams({
        page: 2
      })
      .subscribe(params => {
        expect(params).toMatchObject({
          view: 'flights',
          page: 2,
          sort: 'start_at',
          direction: 'asc'
        });
        done();
      });
  });

  it('should exclude view param from router query params', done => {
    const before = new Date('2019-10-31');
    const after = new Date('2019-10-01');
    dashboardService
      .getRouteQueryParams({
        page: 1,
        view: 'flights'
      })
      .subscribe(params => {
        expect(params).toMatchObject({
          page: 1
        });
        done();
      });
  });

  it('should set dashboard params from route params and load flights or campaigns', () => {
    jest.spyOn(dashboardService, 'loadCampaignList');
    jest.spyOn(dashboardService, 'loadFlightList');
    dashboardService.setParamsFromRoute({ page: 1, sort: 'start_at', direction: 'asc' }, 'flights');
    expect(dashboardService.loadFlightList).toHaveBeenCalledWith({ view: 'flights', page: 1, sort: 'start_at', direction: 'asc' });
    dashboardService.setParamsFromRoute({ page: 1, geo: 'US' }, 'campaigns');
    expect(dashboardService.loadCampaignList).toHaveBeenCalledWith({ view: 'campaigns', page: 1, geo: ['US'] });
  });

  it('should route to params using existing and given params', () => {
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    dashboardService.setParamsFromRoute({ page: 1, status: 'approved' }, 'flights');
    dashboardService.routeToParams({ geo: ['US'] });
    expect(router.navigate).toHaveBeenCalledWith(['flights'], { queryParams: { page: 1, status: 'approved', geo: 'US' } });
    dashboardService.routeToParams({ view: 'campaigns' });
    expect(router.navigate).toHaveBeenCalledWith(['campaigns'], {
      queryParams: { page: 1, status: 'approved' }
    });
  });

  it('should handle errors on load', done => {
    mockHalService.mockError('prx:campaigns', 'Bad Request');
    dashboardService.loadCampaignList();
    dashboardService.campaigns.pipe(withLatestFrom(dashboardService.error)).subscribe(([campaigns, error]: [Campaign[], Error]) => {
      expect(error).toEqual(new Error('Bad Request'));
      done();
    });
  });
});
