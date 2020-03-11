import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { MockHalService } from 'ngx-prx-styleguide';
import { AccountService, AdvertiserService, CampaignStoreService } from '../../core';
import { AdvertiserServiceMock } from '../../core/advertiser/advertiser.service.mock';
import { SharedModule } from '../../shared/shared.module';
import { reducers } from '../store';
import { CampaignFormContainerComponent } from './campaign-form.container';
import { CampaignFormComponent } from './campaign-form.component';

describe('CampaignFormContainerComponent', () => {
  let component: CampaignFormContainerComponent;
  let fix: ComponentFixture<CampaignFormContainerComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const campaignStoreService: CampaignStoreService = { localCampaign$: of({}), setCampaign: jest.fn(() => of({})) } as any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        StoreModule.forRoot({}),
        StoreModule.forFeature('campaignState', reducers)
      ],
      declarations: [CampaignFormContainerComponent, CampaignFormComponent],
      providers: [
        {
          provide: AccountService,
          useValue: { loadAccounts: jest.fn(() => of([])) }
        },
        {
          provide: AdvertiserService,
          useValue: new AdvertiserServiceMock(new MockHalService())
        },
        {
          provide: CampaignStoreService,
          useValue: campaignStoreService
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CampaignFormContainerComponent);
        component = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        fix.detectChanges();
      });
  }));

  it('sets the campaign', () => {
    const campaign = {
      id: 1,
      name: 'my campaign name',
      type: 'paid',
      status: 'draft',
      repName: 'my rep name',
      notes: 'my notes',
      set_account_uri: '/some/account',
      set_advertiser_uri: '/some/advertiser'
    };
    const changed = true;
    const valid = false;
    component.campaignUpdateFromForm({ campaign, changed, valid });
    expect(campaignStoreService.setCampaign).toHaveBeenLastCalledWith({ localCampaign: campaign, changed, valid });
  });

  it('sets the campaign after adding a new advertiser', () => {
    component.onAddAdvertiser('Squarespace');
    expect(campaignStoreService.setCampaign).toHaveBeenCalled();
  });
});
