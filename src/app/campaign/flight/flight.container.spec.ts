import { of, ReplaySubject } from 'rxjs';
import { CampaignStoreService, InventoryService } from '../../core';
import { FlightContainerComponent } from './flight.container';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';

describe('FlightContainerComponent', () => {
  let campaign: ReplaySubject<any>;
  let campaignStoreService: CampaignStoreService;
  let inventoryService: InventoryService;
  let routeId: ReplaySubject<string>;
  let route: ActivatedRoute;
  let router: Router;
  let component: FlightContainerComponent;

  beforeEach(() => {
    campaign = new ReplaySubject(1);
    campaignStoreService = { campaign, setFlight: jest.fn(() => of({})) } as any;
    inventoryService = { listInventory: jest.fn(() => of([])) } as any;
    routeId = new ReplaySubject(1);
    route = { paramMap: routeId.pipe(map(id => ({ get: jest.fn(() => id) }))) } as any;
    router = <any>{ navigate: jest.fn() };
    component = new FlightContainerComponent(route, inventoryService, campaignStoreService, router);
  });

  it('sets the flight id from the route', () => {
    const spy = jest.spyOn(component, 'setFlightId');
    routeId.next('123');
    expect(spy).toHaveBeenCalledWith('123');
  });

  it('loads an existing flight', done => {
    component.state$.subscribe(state => {
      expect(state).toEqual({ name: 'my-flight' });
      done();
    });
    campaign.next({ flights: { 123: { name: 'my-flight' } } });
    component.setFlightId('123');
  });

  it('redirects to campaign if the flight does not exist', () => {
    campaign.next({ flights: { 123: { name: 'my-flight' } } });
    component.setFlightId('456');
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
});
