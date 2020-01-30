import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { SharedModule } from '../../shared/shared.module';

import { campaigns as campaignsFixture } from '../dashboard.service.mock';
import { CampaignCardComponent, CampaignFlightDatesPipe, CampaignFlightTargetsPipe, CampaignFlightZonesPipe, CampaignTypePipe } from '.';

describe('CampaignCardComponent', () => {
  let comp: CampaignCardComponent;
  let fix: ComponentFixture<CampaignCardComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule],
      declarations: [CampaignCardComponent, CampaignFlightDatesPipe, CampaignFlightTargetsPipe, CampaignFlightZonesPipe, CampaignTypePipe]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CampaignCardComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        comp.campaign = campaignsFixture[0];
        fix.detectChanges();
      });
  }));

  it('should show the advertiser and link to the campaign', () => {
    const link = de.query(By.css('h3 > a'));
    expect(link).toBeDefined();
    expect(link.nativeElement.textContent).toMatch(comp.campaign.advertiser.label);
    expect(link.nativeElement.href).toContain('/campaign/' + comp.campaign.id);
  });

  it('should show campaign status', () => {
    expect(de.query(By.css('span.status')).nativeElement.textContent.toLowerCase()).toMatch(comp.campaign.status);
  });
});
