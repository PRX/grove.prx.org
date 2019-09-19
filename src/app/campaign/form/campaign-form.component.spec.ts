import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { CampaignFormComponent } from './campaign-form.component';
import { Campaign } from '../../core';

describe('CampaignFormComponent', () => {
  let component: CampaignFormComponent;
  let fixture: ComponentFixture<CampaignFormComponent>;
  let campaignFixture: Campaign;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, NoopAnimationsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule],
      declarations: [CampaignFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    campaignFixture = {
      name: 'my campaign name',
      type: 'paid_campaign',
      status: 'draft',
      repName: 'my rep name',
      notes: 'my notes',
      set_account_uri: '/some/account',
      set_advertiser_uri: '/some/advertiser'
    };
    fixture = TestBed.createComponent(CampaignFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('updates the campaign form', () => {
    component.campaign = campaignFixture;
    component.ngOnChanges({
      campaign: { previousValue: null, currentValue: campaignFixture, firstChange: true, isFirstChange: () => true }
    });
    expect(component.campaignForm.value).toMatchObject(campaignFixture);
  });

  it('emits form changes', done => {
    component.campaign = campaignFixture;
    component.ngOnChanges({
      flight: { previousValue: null, currentValue: campaignFixture, firstChange: true, isFirstChange: () => true }
    });

    component.campaignUpdate.subscribe(updates => {
      expect(updates).toMatchObject({ campaign: { name: 'brand new name' } });
      done();
    });
    component.name.setValue('brand new name');
  });
});
