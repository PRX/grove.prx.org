import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { FancyFormModule, MockHalService, StatusBarModule } from 'ngx-prx-styleguide';
import { CampaignStatusComponent } from './campaign-status.component';
import { CampaignListServiceMock, params } from '../../campaign-list/campaign-list.service.mock';
import { CampaignListService } from '../../campaign-list/campaign-list.service';

describe('CampaignStatusComponent', () => {
  let comp: CampaignStatusComponent;
  let fix: ComponentFixture<CampaignStatusComponent>;
  let de: DebugElement;
  const mockHal = new MockHalService();
  const mockCampaignListService = new CampaignListServiceMock(mockHal);
  let campaignListService: CampaignListService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FancyFormModule, StatusBarModule, RouterTestingModule],
      providers: [
        {
          provide: CampaignListService,
          useValue: mockCampaignListService
        }
      ],
      declarations: [CampaignStatusComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CampaignStatusComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        campaignListService = TestBed.get(CampaignListService);
        fix.detectChanges();
      });
  }));

  it('links to dashboard with params', () => {
    campaignListService.loadCampaignList(params);
    const queryParams = campaignListService.getRouteQueryParams(params);
    const queryParamsStr = Object.keys(queryParams)
      .map(key => `${key}=${queryParams[key]}`.replace('|', '%7C'))
      .join('&');
    expect(de.query(By.css('prx-status-bar a')).nativeElement.href).toEqual(`http://localhost/?${queryParamsStr}`);
  });
});
