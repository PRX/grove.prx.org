import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSidenavModule, MatListModule, MatIconModule, MatProgressSpinnerModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule, Store } from '@ngrx/store';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../store/router-store/custom-router-serializer';
import { of } from 'rxjs';
import { AccountService, AdvertiserService, AuguryService, InventoryService } from '../core';
import { AllocationPreviewService } from '../core/allocation/allocation-preview.service';
import { AccountServiceMock } from '../core/account/account.service.mock';
import { AdvertiserServiceMock } from '../core/advertiser/advertiser.service.mock';
import { ActivatedRouteStub } from '../../testing/stub.router';
import { FancyFormModule, StatusBarModule, MockHalService } from 'ngx-prx-styleguide';
import { SharedModule } from '../shared/shared.module';
import { reducers } from './store';
import { CampaignActionService } from './store/actions/campaign-action.service';
import { CampaignComponent } from './campaign.component';
import { CampaignStatusComponent } from './status/campaign-status.component';
import { CampaignNavComponent } from './nav/campaign-nav.component';
import { TestComponent, campaignRoutes } from '../../testing/test.component';

describe('CampaignComponent', () => {
  let component: CampaignComponent;
  let fix: ComponentFixture<CampaignComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let router: Router;
  let store: Store<any>;
  let campaignActionService: CampaignActionService;
  const route: ActivatedRouteStub = new ActivatedRouteStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(campaignRoutes),
        StoreModule.forRoot({ router: routerReducer }),
        StoreRouterConnectingModule.forRoot({ serializer: CustomRouterSerializer }),
        StoreModule.forFeature('campaignState', reducers),
        SharedModule,
        FancyFormModule,
        StatusBarModule,
        NoopAnimationsModule,
        MatIconModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatSidenavModule
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
            getAllocationPreview: jest.fn(() => of(undefined))
          }
        },
        {
          provide: InventoryService,
          useValue: { listInventory: jest.fn(() => of([])) }
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

        router = TestBed.get(Router);
        store = TestBed.get(Store);
        campaignActionService = TestBed.get(CampaignActionService);
      });
  }));

  it('inits the campaign state from the route', done => {
    jest.spyOn(campaignActionService, 'loadCampaign');
    router.navigateByUrl('/campaign/123');
    route.setParamMap({ id: '123' });
    route.paramMap.subscribe(() => {
      expect(campaignActionService.loadCampaign).toHaveBeenCalledWith(123);
      done();
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
});
