import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSidenavModule, MatListModule, MatIconModule, MatProgressSpinnerModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { AccountService, AdvertiserService, AuguryService, InventoryService } from '../core';
import { AllocationPreviewService } from '../core/allocation/allocation-preview.service';
import { AccountServiceMock } from '../core/account/account.service.mock';
import { AdvertiserServiceMock } from '../core/advertiser/advertiser.service.mock';
import { ActivatedRouteStub } from '../../testing/stub.router';
import { FancyFormModule, StatusBarModule, MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { SharedModule } from '../shared/shared.module';
import { reducers } from './store';
import * as actions from './store/actions';
import { selectCampaignWithFlightsForSave, selectCampaignId } from './store/selectors';
import { campaignDocFixture, flightFixture, flightDocFixture } from './store/models/campaign-state.factory';
import { CampaignComponent } from './campaign.component';
import { CampaignStatusComponent } from './status/campaign-status.component';
import { CampaignNavComponent } from './nav/campaign-nav.component';

@Component({
  selector: 'grove-test-component',
  template: ``
})
class TestComponent {}
const campaignChildRoutes: Routes = [
  { path: '', component: TestComponent },
  { path: 'flight/:flightId', component: TestComponent }
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

describe('CampaignComponent', () => {
  let component: CampaignComponent;
  let fix: ComponentFixture<CampaignComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let router: Router;
  let store: Store<any>;
  let dispatchSpy;
  const route: ActivatedRouteStub = new ActivatedRouteStub();

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
        MatProgressSpinnerModule,
        MatSidenavModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature('campaignState', reducers)
      ],
      declarations: [CampaignComponent, CampaignNavComponent, CampaignStatusComponent, TestComponent],
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
          provide: AllocationPreviewService,
          useValue: {
            getAllocationPreview: jest.fn(flight => of(undefined))
          }
        },
        {
          provide: InventoryService,
          useValue: { listInventory: jest.fn(() => of([])) }
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
        store = TestBed.get(Store);
        dispatchSpy = jest.spyOn(store, 'dispatch');
      });
  }));

  it('inits the campaign state from the route', done => {
    router.navigateByUrl('/campaign/123');
    route.setParamMap({ id: '123' });
    route.paramMap.subscribe(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignLoad({ id: 123 }));
      done();
    });
  });

  it('submits the campaign forms', done => {
    const flightIds = [flightFixture.id, flightFixture.id + 1, flightFixture.id + 2, flightFixture.id + 3];
    const campaignDoc = new MockHalDoc(campaignDocFixture);
    const flightDocs = [
      new MockHalDoc({ ...flightDocFixture, id: flightIds[0] }),
      new MockHalDoc({ ...flightDocFixture, id: flightIds[1] }),
      new MockHalDoc({ ...flightDocFixture, id: flightIds[2] }),
      new MockHalDoc({ ...flightDocFixture, id: flightIds[3] })
    ];
    const loadAction = new actions.CampaignLoadSuccess({ campaignDoc, flightDocs });
    store.dispatch(loadAction);
    const goalAction = new actions.CampaignFlightSetGoal({ flightId: flightIds[0], totalGoal: 999, dailyMinimum: 9, valid: true });
    store.dispatch(goalAction);
    component.campaignSubmit();
    store.select(selectCampaignWithFlightsForSave).subscribe(campaignFlights => {
      expect(dispatchSpy).toHaveBeenLastCalledWith(new actions.CampaignSave(campaignFlights));
      done();
    });
  });

  it('calls action to add a new flight', done => {
    component.createFlight();
    store.select(selectCampaignId).subscribe(campaignId => {
      expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignAddFlight({ campaignId }));
      done();
    });
  });
});
