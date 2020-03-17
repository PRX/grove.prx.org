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
  MatSelectModule
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { ActivatedRouteStub } from '../../../testing/stub.router';
import { Store, StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../../store/router-store/custom-router-serializer';
import { DatepickerModule, MockHalDoc } from 'ngx-prx-styleguide';
import { CampaignStoreService, InventoryService } from '../../core';
import { SharedModule } from '../../shared/shared.module';
import { flightFixture, flightDocFixture } from '../store/models/campaign-state.factory';
import { reducers } from '../store';
import * as actions from '../store/actions';
import { CampaignActionService } from '../store/actions/campaign-action.service';

import { FlightContainerComponent } from './flight.container';
import { FlightComponent } from './flight.component';
import { AvailabilityComponent } from '../availability/availability.component';
import { GoalFormComponent } from '../availability/goal-form.component';
import { TestComponent } from '../campaign-test.component';

const campaignChildRoutes: Routes = [
  { path: '', component: FlightContainerComponent },
  { path: 'flight/:flightId', component: FlightContainerComponent }
];
const campaignRoutes: Routes = [
  {
    path: 'campaign/new',
    component: TestComponent,
    children: campaignChildRoutes
  },
  {
    path: 'campaign/:id',
    component: TestComponent,
    children: campaignChildRoutes
  }
];

describe('FlightContainerComponent', () => {
  const inventory: ReplaySubject<any> = new ReplaySubject(1);
  let campaignStoreService: CampaignStoreService;
  let campaignActionService: CampaignActionService;
  const route: ActivatedRouteStub = new ActivatedRouteStub();
  let router: Router;
  let store: Store<any>;
  let component: FlightContainerComponent;
  let fix: ComponentFixture<FlightContainerComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const flight = {
    id: 123,
    name: 'my-flight',
    startAt: new Date('2019-10-01'),
    endAt: new Date('2019-11-01'),
    set_inventory_uri: '/some/url',
    zones: ['pre_1'],
    totalGoal: 999
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(campaignRoutes),
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
        MatSelectModule,
        StoreModule.forRoot({ router: routerReducer }),
        StoreRouterConnectingModule.forRoot({ serializer: CustomRouterSerializer }),
        StoreModule.forFeature('campaignState', reducers)
      ],
      declarations: [FlightContainerComponent, FlightComponent, AvailabilityComponent, GoalFormComponent, TestComponent],
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
            loadAvailability: jest.fn(f => of({})),
            loadAllocationPreview: jest.fn(f => of()),
            getFlightAvailabilityRollup$: jest.fn(() => of([]))
          }
        },
        CampaignActionService
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
        store = TestBed.get(Store);
        campaignActionService = TestBed.get(CampaignActionService);

        store.dispatch(
          new actions.CampaignLoadSuccess({ campaignDoc: new MockHalDoc({ id: 1 }), flightDocs: [new MockHalDoc(flightDocFixture)] })
        );
        router.navigateByUrl(`/campaign/1/flight/${flightDocFixture.id}`);
      });
  }));

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('receives availability and allocation preview updates when flight form changes', done => {
    component.flightUpdateFromForm({ flight: { ...flightFixture, endAt: new Date() }, changed: true, valid: true });
    component.flightAvailability$.subscribe(availability => {
      expect(availability).toBeDefined();
      done();
    });
  });

  it('calls action to update the flight', () => {
    jest.spyOn(campaignActionService, 'updateFlightForm');
    component.flightUpdateFromForm({ flight, changed: true, valid: false });
    expect(campaignActionService.updateFlightForm).toHaveBeenCalledWith(flight, true, false);
  });

  it('generates zone options from inventory', done => {
    inventory.next([{ self_uri: flightFixture.set_inventory_uri, zones: flightFixture.zones }]);
    component.zoneOptions$.subscribe(opts => {
      expect(opts).toEqual(flightFixture.zones);
      done();
    });
  });
});
