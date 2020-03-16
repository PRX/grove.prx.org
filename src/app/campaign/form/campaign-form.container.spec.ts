import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { MockHalService } from 'ngx-prx-styleguide';
import { AccountService, AdvertiserService, CampaignStoreService } from '../../core';
import { AdvertiserServiceMock, advertisers } from '../../core/advertiser/advertiser.service.mock';
import { SharedModule } from '../../shared/shared.module';
import { reducers } from '../store';
import * as actions from '../store/actions';
import { CampaignFormContainerComponent } from './campaign-form.container';
import { CampaignFormComponent } from './campaign-form.component';
import { campaignFixture } from '../store/models/campaign-state.factory';

describe('CampaignFormContainerComponent', () => {
  let component: CampaignFormContainerComponent;
  let fix: ComponentFixture<CampaignFormContainerComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let store: Store<any>;
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

        store = TestBed.get(Store);
        jest.spyOn(store, 'dispatch');
      });
  }));

  it('dispatches action to update the campaign from the form', () => {
    const changed = true;
    const valid = false;
    component.campaignUpdateFromForm({ campaign: campaignFixture, changed, valid });
    expect(store.dispatch).toHaveBeenLastCalledWith(new actions.CampaignFormUpdate({ campaign: campaignFixture, changed, valid }));
  });

  it('sets the campaign after adding a new advertiser', () => {
    component.onAddAdvertiser('Squarespace');
    expect(store.dispatch).toHaveBeenCalledWith(
      new actions.CampaignSetAdvertiser({ set_advertiser_uri: (advertisers.length + 1).toString() })
    );
  });
});
