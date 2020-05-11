import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSelectModule
} from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { ActivatedRouteStub } from '../../../testing/stub.router';
import { Store, StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../../store/router-store/custom-router-serializer';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { InventoryService } from '../../core';
import { SharedModule } from '../../shared/shared.module';
import { flightFixture, flightDocFixture, flightDaysData } from '../store/models/campaign-state.factory';
import { reducers } from '../store';
import * as campaignActions from '../store/actions/campaign-action.creator';
import { CampaignActionService } from '../store/actions/campaign-action.service';

import { FlightContainerComponent } from './flight.container';
import { FlightComponent } from './flight.component';
import { InventoryComponent } from '../inventory/inventory.component';
import { InventoryTableComponent } from '../inventory/inventory-table.component';
import { GoalFormComponent } from '../inventory/goal-form.component';
import { TestComponent } from '../../../testing/test.component';
import * as moment from 'moment';

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
  const inventory$: ReplaySubject<any> = new ReplaySubject(1);
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
    startAt: moment.utc('2019-10-01'),
    endAt: moment.utc('2019-11-01'),
    set_inventory_uri: '/some/url',
    zones: [{ id: 'pre_1', label: 'Preroll 1' }],
    totalGoal: 999
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(campaignRoutes),
        SharedModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatSelectModule,
        StoreModule.forRoot({ router: routerReducer }),
        StoreRouterConnectingModule.forRoot({ serializer: CustomRouterSerializer }),
        StoreModule.forFeature('campaignState', reducers)
      ],
      declarations: [
        FlightContainerComponent,
        FlightComponent,
        InventoryComponent,
        InventoryTableComponent,
        GoalFormComponent,
        TestComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: route
        },
        {
          provide: InventoryService,
          useValue: { listInventory: jest.fn(() => inventory$) }
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
        router = TestBed.get(Router);
        store = TestBed.get(Store);
        campaignActionService = TestBed.get(CampaignActionService);

        store.dispatch(
          new campaignActions.CampaignLoadSuccess({
            campaignDoc: new MockHalDoc({ id: 1 }),
            flightDocs: [new MockHalDoc(flightDocFixture)],
            flightDaysDocs: { [flightDocFixture.id]: (flightDaysData as any[]) as MockHalDoc[] }
          })
        );
        fix.ngZone.run(() => router.navigateByUrl(`/campaign/1/flight/${flightDocFixture.id}`));
      });
  }));

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('receives inventory updates when flight form changes', done => {
    component.flightUpdateFromForm({ flight: { ...flightFixture, endAt: moment.utc() }, changed: true, valid: true });
    component.inventoryRollup$.subscribe(inventory => {
      expect(inventory).toBeDefined();
      done();
    });
  });

  it('calls action to update the flight', () => {
    jest.spyOn(campaignActionService, 'updateFlightForm');
    component.flightUpdateFromForm({ flight, changed: true, valid: false });
    expect(campaignActionService.updateFlightForm).toHaveBeenCalledWith(flight, true, false);
  });

  it('generates zone options from inventory', done => {
    inventory$.next([{ self_uri: flightFixture.set_inventory_uri, zones: flightFixture.zones }]);
    component.zoneOptions$.subscribe(opts => {
      expect(opts).toEqual(flightFixture.zones);
      done();
    });
  });
});
