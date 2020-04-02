import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { MockHalService } from 'ngx-prx-styleguide';
import { AccountService, AdvertiserStateService } from '../../core';
import { AdvertiserServiceMock } from '../../core/advertiser/advertiser.service.mock';
import { SharedModule } from '../../shared/shared.module';
import { reducers } from '../store';
import * as campaignActions from '../store/actions/campaign-action.creator';
import { CampaignFormContainerComponent } from './campaign-form.container';
import { CampaignFormComponent } from './campaign-form.component';
import { campaignFixture } from '../store/models/campaign-state.factory';

describe('CampaignFormContainerComponent', () => {
  let component: CampaignFormContainerComponent;
  let fix: ComponentFixture<CampaignFormContainerComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  let store: Store<any>;
  const advertiserService = new AdvertiserServiceMock(new MockHalService());

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
          provide: AdvertiserStateService,
          useValue: advertiserService
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
    expect(store.dispatch).toHaveBeenCalledWith(new campaignActions.CampaignFormUpdate({ campaign: campaignFixture, changed, valid }));
  });

  it('sets the campaign after adding a new advertiser', done => {
    component.onAddAdvertiser('Squarespace');
    advertiserService.advertisers.subscribe(advertisers => {
      const { set_advertiser_uri } = advertisers[advertisers.length - 1];
      expect(store.dispatch).toHaveBeenCalledWith(new campaignActions.CampaignSetAdvertiser({ set_advertiser_uri }));
      done();
    });
  });
});
