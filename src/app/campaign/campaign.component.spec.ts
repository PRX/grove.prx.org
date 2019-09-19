import { CampaignComponent } from './campaign.component';
import { CampaignStoreService, CampaignState, FlightState } from '../core';
import { ReplaySubject, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-prx-styleguide';
import { map } from 'rxjs/operators';

describe('CampaignComponent', () => {
  let routeId: ReplaySubject<string>;
  let route: ActivatedRoute;
  let router: Router;
  let toastrService: ToastrService;
  let campaignStoreService: CampaignStoreService;
  let campaignState: ReplaySubject<CampaignState>;
  let component: CampaignComponent;

  function campaignFactory(attrs = {}): CampaignState {
    return {
      localCampaign: {
        name: 'my campaign',
        type: '',
        status: '',
        repName: '',
        notes: '',
        set_account_uri: '',
        set_advertiser_uri: '',
        ...attrs
      },
      changed: false,
      valid: false,
      flights: {}
    };
  }
  function flightFactory(attrs = {}): FlightState {
    return {
      localFlight: { id: 123, name: 'my flight', startAt: '', endAt: '', totalGoal: 1, set_inventory_uri: '', ...attrs },
      changed: false,
      valid: false
    };
  }

  beforeEach(() => {
    routeId = new ReplaySubject(1);
    route = { paramMap: routeId.pipe(map(id => ({ get: jest.fn(() => id) }))) } as any;
    router = <any>{ navigate: jest.fn(), url: '/campaign/new/flight/9999' };
    toastrService = <any>{ success: jest.fn() };
    campaignState = new ReplaySubject(1);
    campaignStoreService = {
      campaign: campaignState,
      flights$: campaignState.pipe(map(s => s.flights)),
      load: jest.fn(() => campaignState),
      storeCampaign: jest.fn(() => campaignState),
      setFlight: jest.fn()
    } as any;
    component = new CampaignComponent(route, router, toastrService, campaignStoreService);
  });

  it('loads the campaign state from the route', () => {
    routeId.next('123');
    expect(campaignStoreService.load).toHaveBeenCalledWith('123');
  });

  it('loads flights options from the campaign state', done => {
    const campaign = campaignFactory();
    const flight1 = flightFactory({ name: 'Name 1' });
    const flight2 = flightFactory({ name: 'Name 2' });
    campaignState.next({ ...campaign, flights: { flight1, flight2 } });
    component.campaignFlights$.subscribe(options => {
      expect(options).toEqual([{ id: 'flight1', name: 'Name 1' }, { id: 'flight2', name: 'Name 2' }]);
      done();
    });
  });

  it('submits the campaign forms', () => {
    const campaign = campaignFactory();
    campaignState.next(campaign);
    component.campaignSubmit();
    expect(campaignStoreService.storeCampaign).toHaveBeenCalled();
    expect(toastrService.success).toHaveBeenCalledWith('Campaign saved');
  });

  it('redirects to a new campaign', () => {
    const changes = { id: '1234', prevId: null, flights: { 9999: '9999' } };
    campaignStoreService.storeCampaign = jest.fn(() => of(changes)) as any;
    component.campaignSubmit();
    expect(campaignStoreService.storeCampaign).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', '1234']);
  });

  it('redirects to a new flight', () => {
    const changes = { id: '1234', prevId: null, flights: { 9999: '8888' } };
    campaignStoreService.storeCampaign = jest.fn(() => of(changes)) as any;
    component.campaignSubmit();
    expect(campaignStoreService.storeCampaign).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', '1234', 'flight', '8888']);
  });

  it('adds a new flight to the state', () => {
    const spy = jest.spyOn(campaignStoreService, 'setFlight');
    const campaign = campaignFactory();
    campaignState.next(campaign);
    component.createFlight();
    expect(spy).toHaveBeenCalled();
    const flight = spy.mock.calls[0][0];
    const id = spy.mock.calls[0][1];
    expect(flight).toMatchObject({
      localFlight: { name: 'New Flight 1' },
      changed: false,
      valid: true
    });
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', 'new', 'flight', id]);
  });
});
