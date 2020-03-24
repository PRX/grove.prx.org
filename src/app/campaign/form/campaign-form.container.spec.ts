import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { MockHalService } from 'ngx-prx-styleguide';
import { AccountService, AdvertiserService, AllocationPreviewService, InventoryService } from '../../core';
import { AdvertiserServiceMock, advertisers } from '../../core/advertiser/advertiser.service.mock';
import { SharedModule } from '../../shared/shared.module';
import { reducers } from '../store';
import { CampaignActionService } from '../store/actions/campaign-action.service';
import { CampaignFormContainerComponent } from './campaign-form.container';
import { CampaignFormComponent } from './campaign-form.component';
import { campaignFixture } from '../store/models/campaign-state.factory';

describe('CampaignFormContainerComponent', () => {
  let component: CampaignFormContainerComponent;
  let fix: ComponentFixture<CampaignFormContainerComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let campaignActionService: CampaignActionService;

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
        fix = TestBed.createComponent(CampaignFormContainerComponent);
        component = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        fix.detectChanges();

        campaignActionService = TestBed.get(CampaignActionService);
      });
  }));

  it('dispatches action to update the campaign from the form', () => {
    spyOn(campaignActionService, 'updateCampaignForm');
    const changed = true;
    const valid = false;
    component.campaignUpdateFromForm({ campaign: campaignFixture, changed, valid });
    expect(campaignActionService.updateCampaignForm).toHaveBeenLastCalledWith(campaignFixture, changed, valid);
  });

  it('sets the campaign after adding a new advertiser', () => {
    spyOn(campaignActionService, 'setCampaignAdvertiser');
    component.onAddAdvertiser('Squarespace');
    expect(campaignActionService.setCampaignAdvertiser).toHaveBeenCalledWith((advertisers.length + 1).toString());
  });
});
