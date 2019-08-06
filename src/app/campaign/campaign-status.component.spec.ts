import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { MockHalService } from 'ngx-prx-styleguide';
import { SharedModule } from '../shared/shared.module';

import { CampaignStatusComponent } from './campaign-status.component';
import { CampaignService } from './service/campaign.service';
import { CampaignServiceMock } from './service/campaign.service.mock';

describe('CampaignStatusComponent', () => {
  let comp: CampaignStatusComponent;
  let fix: ComponentFixture<CampaignStatusComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockCampaign = new CampaignServiceMock(mockHal);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CampaignStatusComponent
      ],
      imports: [
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        {
          provide: CampaignService,
          useValue: mockCampaign
        }
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(CampaignStatusComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;

      mockCampaign.findCampaignById(1).subscribe(campaign => comp.campaign = campaign);
      fix.detectChanges();
    });
  }));

  it('should show campaign name', () => {
    expect(de.query(By.css('prx-status-bar-text ~ prx-status-bar-text')).nativeElement.textContent).toContain(comp.campaign.name);
  });

  it('should save campaign via the service', () => {
    jest.spyOn(mockCampaign, 'save');
    comp.save();
    expect(mockCampaign.save).toHaveBeenCalled();
  });
});
