import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule, Store } from '@ngrx/store';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../store/router-store/custom-router-serializer';
import { of } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuguryService, InventoryService } from '../core';
import { ActivatedRouteStub } from '../../testing/stub.router';
import { FancyFormModule, StatusBarModule, MockHalService } from 'ngx-prx-styleguide';
import { SharedModule } from '../shared/shared.module';
import { reducers } from './store';
import { CampaignActionService } from './store/actions/campaign-action.service';
import * as campaignActions from './store/actions/campaign-action.creator';
import { CampaignComponent } from './campaign.component';
import { CampaignStatusComponent } from './status/campaign-status.component';
import { CampaignReportComponent } from './report/campaign-report.component';
import { CampaignNavComponent } from './nav/campaign-nav.component';
import { CampaignErrorService } from './campaign-error.service';
import { TestComponent, campaignRoutes } from '../../testing/test.component';
import { campaignFixture, flightFixture } from './store/models/campaign-state.factory';
import * as moment from 'moment';
import { Flight } from './store/models';

describe('CampaignComponent', () => {
  let component: CampaignComponent;
  let fix: ComponentFixture<CampaignComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let router: Router;
  let store: Store<any>;
  let campaignActionService: CampaignActionService;
  const route: ActivatedRouteStub = new ActivatedRouteStub();
  // workaround to set the window.history.state readonly property
  // Angular sets it from a routerLink state
  Object.defineProperty(window.history, 'state', { writable: true, value: {} });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(campaignRoutes),
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
        StoreModule.forFeature('campaignState', reducers),
        SharedModule,
        FancyFormModule,
        StatusBarModule,
        NoopAnimationsModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatSidenavModule
      ],
      declarations: [CampaignComponent, CampaignNavComponent, CampaignStatusComponent, CampaignReportComponent, TestComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: route
        },
        {
          provide: AuguryService,
          userValue: new MockHalService()
        },
        {
          provide: InventoryService,
          useValue: { listInventory: jest.fn(() => of([])) }
        },
        {
          provide: CampaignErrorService,
          userValue: {}
        },
        CampaignActionService
      ]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CampaignComponent);
        component = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        fix.detectChanges();

        router = TestBed.inject(Router);
        store = TestBed.inject(Store);
        campaignActionService = TestBed.inject(CampaignActionService);
      });
  }));

  it('inits the campaign state from the route', done => {
    jest.spyOn(store, 'dispatch');
    fix.ngZone.run(() => {
      router.navigateByUrl('/campaign/123');
      route.setParamMap({ id: '123' });
      route.paramMap.pipe(first()).subscribe(() => {
        expect(store.dispatch).toHaveBeenLastCalledWith(campaignActions.CampaignLoad({ id: 123 }));
        done();
      });
    });
  });

  describe('temporary flightId timestamp', () => {
    // mock the flight tempId
    const timestamp = Date.now();
    beforeEach(() => {
      global.Date.now = jest.fn(() => timestamp);
      jest.spyOn(store, 'dispatch');
    });
    it('calls action to duplicate a campaign by id', done => {
      // id is passed through the /campaign/new router link state
      Object.defineProperty(window.history, 'state', { writable: true, value: { id: 123 } });
      fix.ngZone.run(() => {
        router.navigateByUrl('/campaign/new');
        route.setParamMap({});
        route.paramMap.pipe(first()).subscribe(() => {
          expect(store.dispatch).toHaveBeenLastCalledWith(campaignActions.CampaignDupById({ id: 123, timestamp }));
          done();
        });
      });
    });

    it('calls action to duplicate a campaign from form', done => {
      // campaign and flights are passed through the /capaign/new router link state
      Object.defineProperty(window.history, 'state', { writable: true, value: { campaign: campaignFixture, flights: [flightFixture] } });
      fix.ngZone.run(() => {
        router.navigateByUrl('/campaign/new');
        route.setParamMap({});
        route.paramMap.pipe(first()).subscribe(() => {
          expect(store.dispatch).toHaveBeenLastCalledWith(
            campaignActions.CampaignDupFromForm({ campaign: campaignFixture, flights: [flightFixture], timestamp })
          );
          done();
        });
      });
    });
  });

  it('submits the campaign forms', () => {
    jest.spyOn(campaignActionService, 'saveCampaignAndFlights');
    component.campaignSubmit();
    expect(campaignActionService.saveCampaignAndFlights).toHaveBeenCalled();
  });

  it('calls action to add a new flight', () => {
    jest.spyOn(campaignActionService, 'addFlight');
    component.createFlight();
    expect(campaignActionService.addFlight).toHaveBeenCalled();
  });

  it('calls action to delete active flight flight', () => {
    jest.spyOn(campaignActionService, 'deleteRoutedFlightToggle');
    component.flightDeleteToggle();
    expect(campaignActionService.deleteRoutedFlightToggle).toHaveBeenCalled();
  });

  it('calls action to duplicate active flight flight', () => {
    const flightFixture: Flight = {
      name: 'my-flight',
      status: 'approved',
      startAt: moment.utc(),
      endAt: moment.utc(),
      endAtFudged: moment.utc().subtract(1, 'days'),
      totalGoal: 123,
      zones: [{ id: 'pre_1' }],
      targets: [],
      set_inventory_uri: '/some/inventory',
      deliveryMode: 'capped'
    };
    jest.spyOn(campaignActionService, 'dupFlight');
    component.flightDuplicate(flightFixture);
    expect(campaignActionService.dupFlight).toHaveBeenCalledWith(flightFixture);
  });
});
