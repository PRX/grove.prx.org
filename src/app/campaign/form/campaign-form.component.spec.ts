import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { CampaignFormComponent } from './campaign-form.component';
import { Campaign } from '../store/models';
import { SharedModule } from '../../shared/shared.module';

describe('CampaignFormComponent', () => {
  let component: CampaignFormComponent;
  let fixture: ComponentFixture<CampaignFormComponent>;
  let campaignFixture: Campaign;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule
      ],
      declarations: [CampaignFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    campaignFixture = {
      name: 'my campaign name',
      type: 'paid',
      status: 'draft',
      repName: 'my rep name',
      notes: 'my notes',
      set_account_uri: '/some/account',
      set_advertiser_uri: '/advertiser/1'
    };
    fixture = TestBed.createComponent(CampaignFormComponent);
    component = fixture.componentInstance;
    component.advertisers = [
      { id: 1, name: 'some ads', set_advertiser_uri: '/advertiser/1' },
      { id: 2, name: 'more ads', set_advertiser_uri: '/advertiser/2' },
      { id: 3, name: 'less ads', set_advertiser_uri: '/advertiser/3' }
    ];
    fixture.detectChanges();
  });

  it('updates the campaign form', () => {
    component.campaign = campaignFixture;
    expect(component.campaignForm.value).toMatchObject(campaignFixture);
  });

  it('emits form changes', done => {
    component.campaign = campaignFixture;
    component.campaignUpdate.subscribe(updates => {
      expect(updates).toMatchObject({ campaign: { name: 'brand new name' } });
      done();
    });
    component.name.setValue('brand new name');
  });

  it('emits advertiser when one is matched by name', done => {
    component.campaign = campaignFixture;
    component.campaignUpdate.subscribe(updates => {
      expect(updates).toMatchObject({ campaign: { set_advertiser_uri: '/advertiser/2' } });
      done();
    });
    component.set_advertiser_uri.setValue('more ads');
  });

  it('sets advertiser in the form when one is matched by URI or to null', () => {
    component.campaign = campaignFixture;
    jest.spyOn(component.campaignForm, 'patchValue');
    component.updateCampaignForm({ set_advertiser_uri: '/any/random/value' } as Campaign);
    expect(component.campaignForm.patchValue).toHaveBeenCalledWith({}, { emitEvent: false, onlySelf: true });
    component.updateCampaignForm({ set_advertiser_uri: '/advertiser/2' } as Campaign);
    expect(component.campaignForm.patchValue).toHaveBeenCalledWith(
      { set_advertiser_uri: '/advertiser/2' },
      { emitEvent: false, onlySelf: true }
    );
    component.updateCampaignForm({ set_advertiser_uri: null } as Campaign);
    expect(component.campaignForm.patchValue).toHaveBeenCalledWith({ set_advertiser_uri: null }, { emitEvent: false, onlySelf: true });
  });
});
