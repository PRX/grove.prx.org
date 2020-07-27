import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';

import { campaigns as campaignsFixture } from '../dashboard.service.mock';
import { CampaignCardComponent, CampaignCardAbbreviateNumberPipe, CampaignFlightDatesPipe } from '.';

describe('CampaignCardComponent', () => {
  let comp: CampaignCardComponent;
  let fix: ComponentFixture<CampaignCardComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule, MatIconModule],
      declarations: [CampaignCardComponent, CampaignCardAbbreviateNumberPipe, CampaignFlightDatesPipe]
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

  it('should return formatted campaign progress percentage', () => {
    comp.campaign = campaignsFixture[0];
    fix.detectChanges();
    expect(comp.progressPercent).toBe('10%');
    comp.campaign = campaignsFixture[1];
    fix.detectChanges();
    expect(comp.progressPercent).toBe('60%');
    comp.campaign = campaignsFixture[2];
    fix.detectChanges();
    expect(comp.progressPercent).toBe('100%');
  });
});
