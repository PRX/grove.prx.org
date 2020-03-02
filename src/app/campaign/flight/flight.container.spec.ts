import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatSelectModule
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from '../../../testing/stub.router';
import { StoreModule } from '@ngrx/store';
import { DatepickerModule } from 'ngx-prx-styleguide';
import { CampaignStoreService, InventoryService } from '../../core';
import { SharedModule } from '../../shared/shared.module';
import { reducers } from '../store';

import { FlightContainerComponent } from './flight.container';
import { FlightComponent } from './flight.component';
import { AvailabilityComponent } from '../availability/availability.component';
import { GoalFormComponent } from '../availability/goal-form.component';

describe('FlightContainerComponent', () => {
  const campaign: ReplaySubject<any> = new ReplaySubject(1);
  const inventory: ReplaySubject<any> = new ReplaySubject(1);
  let campaignStoreService: CampaignStoreService;
  const route: ActivatedRouteStub = new ActivatedRouteStub();
  let router: Router;
  let component: FlightContainerComponent;
  let fix: ComponentFixture<FlightContainerComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        DatepickerModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature('campaignState', reducers)
      ],
      declarations: [FlightContainerComponent, FlightComponent, AvailabilityComponent, GoalFormComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: route
        },
        {
          provide: InventoryService,
          useValue: { listInventory: jest.fn(() => inventory) }
        },
        {
          provide: CampaignStoreService,
          useValue: {
            campaign$: campaign,
            campaignFirst$: campaign.pipe(first()),
            setFlight: jest.fn(() => of({})),
            setCurrentFlightId: jest.fn(id => {}),
            loadAvailability: jest.fn(f => of({})),
            loadAllocationPreview: jest.fn(f => of()),
            getFlightAvailabilityRollup$: jest.fn(id => of([])),
            getFlightDailyMin$: jest.fn(id => of(0))
          }
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(FlightContainerComponent);
        component = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        fix.detectChanges();
        campaignStoreService = TestBed.get(CampaignStoreService);
        router = TestBed.get(Router);
      });
  }));

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('sets the flight id from the route', () => {
    const spy = jest.spyOn(component, 'setFlightId');
    route.setParamMap({ flightId: 123 });
    campaign.next({ flights: {} });
    expect(spy).toHaveBeenCalledWith(123, { flights: {} });
  });

  it('loads an existing flight', done => {
    component.flightState$.subscribe(state => {
      expect(state.localFlight).toEqual({ name: 'my-flight' });
      done();
    });
    campaign.next({ flights: { 123: { localFlight: { name: 'my-flight' } } } });
    route.setParamMap({ flightId: 123 });
  });

  it('loads inventory availability', done => {
    campaign.next({
      flights: { 123: { localFlight: { name: 'my-flight' } }, 321: { localFlight: { name: 'my-other-flight' } } },
      availability: {}
    });
    route.setParamMap({ flightId: 321 });
    component.flightAvailability$.pipe(first()).subscribe(availability => {
      expect(availability).toBeDefined();
      expect(campaignStoreService.loadAvailability).toHaveBeenCalled();
      done();
    });
    route.setParamMap({ flightId: 123 });
  });

  it('loads availability and allocation preview when flight changes', done => {
    const flight = {
      name: 'my-flight',
      totalGoal: 999,
      startAt: '2019-10-01',
      endAt: '2019-11-01',
      set_inventory_uri: '/some/url',
      zones: ['pre_1']
    };
    campaign.next({
      flights: {
        123: {
          localFlight: flight
        }
      },
      availability: {}
    });
    route.setParamMap({ flightId: 123 });
    component.flightUpdateFromForm({ flight: { ...flight, startAt: '2019-10-15' }, changed: true, valid: true });
    component.flightAvailability$.subscribe(availability => {
      expect(availability).toBeDefined();
      expect(campaignStoreService.loadAvailability).toHaveBeenCalled();
      expect(campaignStoreService.loadAllocationPreview).toHaveBeenCalled();
      done();
    });
  });

  it('does not load allocation preview if flight name changes', () => {
    const flight = {
      id: 123,
      name: 'my-flight'
    };
    campaign.next({
      flights: {
        123: {
          localFlight: flight
        }
      },
      availability: {}
    });
    route.setParamMap({ flightId: 123 });
    component.flightUpdateFromForm({ flight: { ...flight, name: 'my-other-flight' }, changed: true, valid: true });
    expect(campaignStoreService.loadAllocationPreview).not.toHaveBeenCalled();
  });

  it('does not load allocation preview if id does not match flight in state', () => {
    const flight = {
      id: 123,
      name: 'my-flight'
    };
    campaign.next({
      flights: {
        123: {
          localFlight: flight
        }
      },
      availability: {}
    });
    route.setParamMap({ flightId: 123 });
    component.flightUpdateFromForm({ flight: { id: 124, name: 'New Flight 124' }, changed: true, valid: true });
    expect(campaignStoreService.loadAllocationPreview).not.toHaveBeenCalled();
  });

  // TODO: no longer does this because it caused a premature navigation bug, should we create a better way to detect it?
  xit('redirects to campaign if the flight does not exist', () => {
    campaign.next({ flights: { 123: { localFlight: { name: 'my-flight' } } } });
    route.setParamMap({ flightId: 456 });
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', 'new']);
  });

  it('toggles soft deletion of flights in state', () => {
    campaign.next({ flights: { 123: { localFlight: { name: 'my-flight' } } } });
    route.setParamMap({ flightId: 123 });
    component.flightDeleteToggle();
    campaign.next({ flights: { 123: { localFlight: { name: 'my-flight' }, softDeleted: true } } });
    component.flightDeleteToggle();
    expect(campaignStoreService.setFlight).toHaveBeenNthCalledWith(1, expect.objectContaining({ softDeleted: true }), 123);
    expect(campaignStoreService.setFlight).toHaveBeenNthCalledWith(2, expect.objectContaining({ softDeleted: false }), 123);
  });

  it('sets the flight', () => {
    const localFlight = {
      id: 123,
      name: 'my flight name',
      set_inventory_uri: '/some/inventory'
    };
    const changed = true;
    const valid = false;

    campaign.next({ flights: { 123: { localFlight } } });
    route.setParamMap({ flightId: 123 });

    component.flightUpdateFromForm({ flight: localFlight, changed, valid });
    expect(campaignStoreService.setFlight).toHaveBeenCalledWith({ localFlight, changed, valid }, 123);
  });

  it('generates zone options from inventory', done => {
    component.zoneOptions$.subscribe(opts => {
      expect(opts).toEqual(['z2', 'z22']);
      done();
    });

    const flight = { set_inventory_uri: '/inv/2' };
    campaign.next({ flights: { 123: { localFlight: flight } } });
    route.setParamMap({ flightId: 123 });
    inventory.next([
      { self_uri: '/inv/1', zones: ['z1'] },
      { self_uri: '/inv/2', zones: ['z2', 'z22'] },
      { self_uri: '/inv/3', zones: ['z3'] }
    ]);
  });
});
