import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { MockHalService } from 'ngx-prx-styleguide';
import { SharedModule } from '../../shared/shared.module';

import { CampaignListComponent } from './campaign-list.component';
import { CampaignListPagingComponent } from './campaign-list-paging.component';
import { CampaignService } from '../service/campaign.service';
import { CampaignServiceMock } from '../service/campaign.service.mock';
import { CampaignModel } from '../../shared/model/campaign.model';

describe('CampaignListComponent', () => {
  let comp: CampaignListComponent;
  let fix: ComponentFixture<CampaignListComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockCampaignService = new CampaignServiceMock(mockHal);
  let mockCampaigns: CampaignModel[];

  mockCampaignService.campaigns.subscribe(campaigns => mockCampaigns = campaigns);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CampaignListComponent,
        CampaignListPagingComponent
      ],
      imports: [
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        {
          provide: CampaignService,
          useValue: mockCampaignService
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

  it('should show list of campaigns', () => {
    const campaignList = de.queryAll(By.css('li'));
    expect(campaignList.length).toEqual(mockCampaigns.length);
    expect(campaignList[0].nativeElement.textContent).toContain(mockCampaigns[0].name);
  });
});
