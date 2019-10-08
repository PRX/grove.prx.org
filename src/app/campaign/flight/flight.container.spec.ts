import { of, ReplaySubject } from 'rxjs';
import { CampaignStoreService, InventoryService } from '../../core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { FlightContainerComponent } from './flight.container';

describe('FlightContainerComponent', () => {
  let campaign: ReplaySubject<any>;
  let campaignStoreService: CampaignStoreService;
  let inventory: ReplaySubject<any>;
  let inventoryService: InventoryService;
  let routeId: ReplaySubject<string>;
  let route: ActivatedRoute;
  let router: Router;
  let component: FlightContainerComponent;

  beforeEach(() => {
    campaign = new ReplaySubject(1);
    campaignStoreService = {
      campaign$: campaign,
      setFlight: jest.fn(() => of({})),
      setCurrentFlightId: jest.fn((id) => {}),
      loadAvailability: jest.fn((f) => of({})),
      getFlightAvailabilityRollup$: jest.fn((id) => of([]))
    } as any;
    inventory = new ReplaySubject(1);
    inventoryService = { listInventory: jest.fn(() => inventory) } as any;
    routeId = new ReplaySubject(1);
    route = { paramMap: routeId.pipe(map(id => ({ get: jest.fn(() => id) }))) } as any;
    router = { navigate: jest.fn() } as any;
    component = new FlightContainerComponent(route, inventoryService, campaignStoreService, router);
    component.ngOnInit();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('sets the flight id from the route', () => {
    const spy = jest.spyOn(component, 'setFlightId');
    campaign.next({});
    routeId.next('123');
    expect(spy).toHaveBeenCalledWith('123', {});
  });

  it('loads an existing flight', done => {
    component.flightState$.subscribe(state => {
      expect(state).toEqual({ name: 'my-flight' });
      done();
    });
    campaign.next({ flights: { 123: { name: 'my-flight' } } });
    routeId.next('123');
  });

  it('loads inventory availability', done => {
    routeId.next('321');
    campaign.next({ flights: { 123: { name: 'my-flight'} , 321: { name: 'my-other-flight' } }, availability: {} });
    component.flightAvailability$.subscribe(availability => {
      expect(availability).toBeDefined();
      expect(campaignStoreService.loadAvailability).toHaveBeenCalled();
      done();
    });
    routeId.next('123');
  });

  it('redirects to campaign if the flight does not exist', () => {
    campaign.next({ flights: { 123: { name: 'my-flight' } } });
    routeId.next('456');
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', 'new']);
  });

  it('sets the flight', () => {
    const flight = {
      id: 123,
      name: 'my flight name',
      set_inventory_uri: '/some/inventory'
    };
    const changed = true;
    const valid = false;

    campaign.next({ flights: { 123: flight } });
    routeId.next('123');

    component.flightUpdateFromForm({ flight, changed, valid });
    expect(campaignStoreService.setFlight).toHaveBeenCalledWith({ localFlight: flight, changed, valid }, '123');
  });

  it('generates zone options from inventory', done => {
    component.zoneOptions$.subscribe(opts => {
      expect(opts).toEqual(['z2', 'z22']);
      done();
    });

    const flight = { set_inventory_uri: '/inv/2' };
    campaign.next({ flights: { 123: { localFlight: flight } } });
    routeId.next('123');
    inventory.next([
      { self_uri: '/inv/1', zones: ['z1'] },
      { self_uri: '/inv/2', zones: ['z2', 'z22'] },
      { self_uri: '/inv/3', zones: ['z3'] }
    ]);
  });
});
