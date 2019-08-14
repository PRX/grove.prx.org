import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { TabModule, MockHalService } from 'ngx-prx-styleguide';
import { SharedModule } from '../shared/shared.module';

import { CampaignComponent } from './campaign.component';
import { CampaignStatusComponent } from './campaign-status.component';
import { CampaignService } from './service/campaign.service';
import { CampaignServiceMock } from './service/campaign.service.mock';

describe('CampaignComponent', () => {
  let comp: CampaignComponent;
  let fix: ComponentFixture<CampaignComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockCampaign = new CampaignServiceMock(mockHal);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CampaignComponent,
        CampaignStatusComponent
      ],
      imports: [
        RouterTestingModule,
        SharedModule,
        TabModule
      ],
      providers: [
        {
          provide: CampaignService,
          useValue: mockCampaign
        }
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(CampaignComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;

      comp.id = 1;
      mockCampaign.findCampaignById(comp.id).subscribe(campaign => comp.campaign = campaign);
      fix.detectChanges();
    });
  }));

  it('should show tabs', () => {
    const length = comp.campaign.flights ? 1 + comp.campaign.flights.length : 1;
    expect(de.queryAll(By.css('prx-tabs nav > a')).length).toEqual(length);
  });

  it('should allow adding a flight after the campaign has been created', () => {
    expect(de.query(By.css('prx-tabs .links > a')).nativeElement.textContent).toContain('Add a Flight');
  });
});
