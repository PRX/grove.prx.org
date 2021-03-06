import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { ActivatedRouteStub } from '../../../testing/stub.router';
import { Store, StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../../store/router-store/custom-router-serializer';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { SharedModule } from '../../shared/shared.module';
import { flightFixture, flightDocFixture, flightDaysData, inventoryDocsFixture } from '../store/models/campaign-state.factory';
import { reducers } from '../store';
import * as campaignActions from '../store/actions/campaign-action.creator';
import * as inventoryActions from '../store/actions/inventory-action.creator';
import { CampaignActionService } from '../store/actions/campaign-action.service';

import { FlightContainerComponent } from './flight.container';
import { FlightFormControlContainerComponent } from './flight-form-control-container.component';
import { FlightFormComponent } from './flight-form.component';
import { FlightTargetsFormComponent } from './flight-targets-form.component';
import { FlightZonesFormComponent } from './flight-zones-form.component';
import { InventoryComponent } from '../inventory/inventory.component';
import { InventoryTableComponent } from '../inventory/inventory-table.component';
import { GoalFormComponent } from '../inventory/goal-form.component';
import { CreativeCardComponent } from '../creative/creative-card.component';
import { TestComponent } from '../../../testing/test.component';
import * as moment from 'moment';

const campaignChildRoutes: Routes = [
  { path: '', component: TestComponent },
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
    status: 'approved',
    startAt: moment.utc('2019-10-01'),
    endAt: moment.utc('2019-11-01'),
    endAtFudged: moment.utc('2019-10-31'),
    set_inventory_uri: '/some/url',
    zones: [{ id: 'pre_1', label: 'Preroll 1' }],
    targets: [],
    totalGoal: 999,
    deliveryMode: 'capped'
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
        MatNativeDateModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatMenuModule,
        MatSidenavModule,
        StoreModule.forRoot(
          { router: routerReducer },
          {
            runtimeChecks: {
              strictStateImmutability: true,
              strictActionImmutability: true
            }
          }
        ),
        StoreRouterConnectingModule.forRoot({ serializer: CustomRouterSerializer }),
        StoreModule.forFeature('campaignState', reducers)
      ],
      declarations: [
        FlightContainerComponent,
        FlightFormControlContainerComponent,
        FlightFormComponent,
        FlightTargetsFormComponent,
        FlightZonesFormComponent,
        InventoryComponent,
        InventoryTableComponent,
        GoalFormComponent,
        CreativeCardComponent,
        TestComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: route
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
        router = TestBed.inject(Router);
        store = TestBed.inject(Store);
        campaignActionService = TestBed.inject(CampaignActionService);

        store.dispatch(
          campaignActions.CampaignLoadSuccess({
            campaignDoc: new MockHalDoc({ id: 1 }),
            flightDocs: [new MockHalDoc(flightDocFixture)],
            flightDaysDocs: { [flightDocFixture.id]: (flightDaysData as any[]) as MockHalDoc[] }
          })
        );
        store.dispatch(inventoryActions.InventoryLoadSuccess({ docs: inventoryDocsFixture }));
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

  it('generates inventory options', done => {
    component.inventoryOptions$.subscribe(opts => {
      expect(opts.length).toEqual(inventoryDocsFixture.length);
      expect(opts.map(opt => opt.id)).toEqual(inventoryDocsFixture.map(doc => doc.id));
      done();
    });
  });

  it('generates zone options from inventory', done => {
    component.zoneOptions$.subscribe(opts => {
      expect(opts.length).toEqual(inventoryDocsFixture[0]['zones'].length);
      expect(opts.map(opt => opt.id)).toEqual(inventoryDocsFixture[0]['zones'].map((z: any) => z.id));
      done();
    });
  });
});
