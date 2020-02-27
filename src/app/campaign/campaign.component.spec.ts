import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSidenavModule, MatListModule, MatIconModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { ReplaySubject, of } from 'rxjs';
import { map, first } from 'rxjs/operators';
import {
  CampaignStoreService,
  CampaignState,
  FlightState,
  AccountService,
  AdvertiserService,
  AuguryService,
  CampaignStateChanges
} from '../core';
import { AccountServiceMock } from '../core/account/account.service.mock';
import { AdvertiserServiceMock } from '../core/advertiser/advertiser.service.mock';
import { ActivatedRouteStub } from '../../testing/stub.router';
import { FancyFormModule, StatusBarModule, ToastrService, MockHalService, HalDoc } from 'ngx-prx-styleguide';
import { SharedModule } from '../shared/shared.module';
import { reducers } from './store';
import { CampaignComponent } from './campaign.component';
import { CampaignStatusComponent } from './status/campaign-status.component';

@Component({
  selector: 'grove-test-component',
  template: ``
})
class TestComponent {}
const campaignChildRoutes: Routes = [
  { path: '', component: TestComponent },
  { path: 'flight/:flightid', component: TestComponent }
];
const campaignRoutes: Routes = [
  {
    path: 'campaign/new',
    component: CampaignComponent,
    children: campaignChildRoutes
  },
  {
    path: 'campaign/:id',
    component: CampaignComponent,
    children: campaignChildRoutes
  }
];

describe('CampaignComponent', () => {
  let component: CampaignComponent;
  let fix: ComponentFixture<CampaignComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let router: Router;
  const route: ActivatedRouteStub = new ActivatedRouteStub();
  const campaignState = new ReplaySubject<CampaignState>(1);
  const campaignStoreService = {
    campaignFirst$: campaignState,
    flights$: campaignState.pipe(map(s => s.flights)),
    load: jest.fn(() => campaignState),
    storeCampaign: jest.fn(() => of([{}, []])),
    setFlight: jest.fn()
  };
  const toastrService: ToastrService = { success: jest.fn() } as any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(campaignRoutes),
        SharedModule,
        FancyFormModule,
        StatusBarModule,
        NoopAnimationsModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature('campaignState', reducers)
      ],
      declarations: [CampaignComponent, CampaignStatusComponent, TestComponent],
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
          provide: AccountService,
          useValue: new AccountServiceMock()
        },
        {
          provide: AdvertiserService,
          useValue: new AdvertiserServiceMock(new MockHalService())
        },
        {
          provide: CampaignStoreService,
          useValue: campaignStoreService
        },
        {
          provide: ToastrService,
          useValue: toastrService
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CampaignComponent);
        component = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        fix.detectChanges();

        router = TestBed.get(Router);
        jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
      });
  }));

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
      localFlight: { id: 123, name: 'my flight', startAt: '', endAt: '', totalGoal: 1, set_inventory_uri: '', zones: [], ...attrs },
      changed: false,
      valid: false
    };
  }

  it('loads the campaign state from the route', done => {
    route.setParamMap({ id: '123' });
    route.paramMap.subscribe(params => {
      expect(campaignStoreService.load).toHaveBeenCalledWith('123');
      done();
    });
  });

  it('loads flights options from the campaign state', done => {
    const campaign = campaignFactory();
    const flight1 = flightFactory({ name: 'Name 1' });
    const flight2 = flightFactory({ name: 'Name 2' });
    campaignState.next({ ...campaign, flights: { flight1, flight2 } });
    component.campaignFlights$.pipe(first()).subscribe(options => {
      expect(options).toMatchObject([
        { id: 'flight1', name: 'Name 1' },
        { id: 'flight2', name: 'Name 2' }
      ]);
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

  it('redirects to a new flight', () => {
    jest.spyOn(router, 'url', 'get').mockReturnValue('/campaign/null/flight/9999');
    const changes: CampaignStateChanges = { id: 1234, prevId: null, flights: { 9999: 8888 } };
    campaignStoreService.storeCampaign.mockImplementation(() => of([changes, []]));
    component.campaignSubmit();
    expect(campaignStoreService.storeCampaign).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', 1234, 'flight', 8888]);
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
