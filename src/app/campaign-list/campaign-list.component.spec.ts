import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { MockHalService, PagingModule } from 'ngx-prx-styleguide';
import { SharedModule } from '../shared/shared.module';

import { CampaignListService } from './campaign-list.service';
import { CampaignListServiceMock, campaigns as campaignsFixture } from './campaign-list.service.mock';
import { CampaignListComponent } from './campaign-list.component';
import { CampaignCardComponent } from './campaign-card.component';
import { CampaignFlightDatesPipe } from './campaign-flight-dates.pipe';
import { CampaignFlightTargetsPipe } from './campaign-flight-targets.pipe';
import { CampaignFlightZonesPipe } from './campaign-flight-zones.pipe';
import { CampaignTypePipe } from './campaign-type.pipe';

describe('CampaignListComponent', () => {
  let comp: CampaignListComponent;
  let fix: ComponentFixture<CampaignListComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockCampaignListService = new CampaignListServiceMock(mockHal);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        PagingModule,
        SharedModule
      ],
      declarations: [
        CampaignCardComponent,
        CampaignFlightDatesPipe,
        CampaignFlightTargetsPipe,
        CampaignFlightZonesPipe,
        CampaignTypePipe,
        CampaignListComponent
      ],
      providers: [
        {
          provide: CampaignListService,
          useValue: mockCampaignListService
        }
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(CampaignListComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;
      fix.detectChanges();
    });
  }));

  it('should show page 1 of campaigns', () => {
    expect(de.query(By.css('prx-paging'))).toBeDefined();
    expect(de.query(By.css('prx-paging button.paging.active')).nativeElement.textContent).toMatch('1');
    expect(de.queryAll(By.css('grove-campaign-card')).length).toEqual(campaignsFixture.length);
  });
});
