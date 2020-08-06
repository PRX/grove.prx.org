import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { MatIconModule, MatMenuModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { FancyFormModule, MockHalService, StatusBarModule } from 'ngx-prx-styleguide';
import { CampaignStatusComponent } from './campaign-status.component';
import { CampaignReportComponent } from '../report/campaign-report.component';
import { DashboardServiceMock, params } from '../../dashboard/dashboard.service.mock';
import { DashboardService } from '../../dashboard/dashboard.service';

describe('CampaignStatusComponent', () => {
  let comp: CampaignStatusComponent;
  let fix: ComponentFixture<CampaignStatusComponent>;
  let de: DebugElement;
  const mockHal = new MockHalService();
  const mockDashboardService = new DashboardServiceMock(mockHal);
  let dashboardService: DashboardService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FancyFormModule, StatusBarModule, RouterTestingModule, MatIconModule, MatMenuModule],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService
        }
      ],
      declarations: [CampaignStatusComponent, CampaignReportComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CampaignStatusComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        dashboardService = TestBed.get(DashboardService);
        dashboardService.setParamsFromRoute(params, 'flights');
        fix.detectChanges();
      });
  }));

  it('links to dashboard with params', done => {
    dashboardService.getRouteQueryParams(params).subscribe(queryParams => {
      const queryParamsStr = Object.keys(queryParams)
        .map(key => `${key}=${queryParams[key]}`.replace('|', '%7C'))
        .join('&');
      expect(de.query(By.css('prx-status-bar a')).nativeElement.href).toEqual(`http://localhost/?${queryParamsStr}`);
      done();
    });
  });
});
