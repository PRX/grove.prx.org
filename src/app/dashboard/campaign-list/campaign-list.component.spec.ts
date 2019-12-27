import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, MatSelectModule } from '@angular/material';
import { MockHalService, PagingModule } from 'ngx-prx-styleguide';
import { SharedModule } from '../../shared/shared.module';

import { DashboardService } from '../dashboard.service';
import { DashboardServiceMock, campaigns as campaignsFixture, params } from '../dashboard.service.mock';
import { CampaignListComponent, CampaignListTotalPagesPipe } from './';
import {
  CampaignCardComponent,
  CampaignFlightDatesPipe,
  CampaignFlightTargetsPipe,
  CampaignFlightZonesPipe,
  CampaignTypePipe
} from '../campaign-card';

describe('CampaignListComponent', () => {
  let comp: CampaignListComponent;
  let fix: ComponentFixture<CampaignListComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const queryParams = new Subject();
  const mockHal = new MockHalService();
  const mockDashboardService = new DashboardServiceMock(mockHal);
  let dashboardService: DashboardService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        MatSelectModule,
        NoopAnimationsModule,
        PagingModule,
        SharedModule
      ],
      declarations: [
        CampaignCardComponent,
        CampaignFlightDatesPipe,
        CampaignFlightTargetsPipe,
        CampaignFlightZonesPipe,
        CampaignTypePipe,
        CampaignListComponent,
        CampaignListTotalPagesPipe
      ],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService
        },
        {
          provide: ActivatedRoute,
          useValue: { queryParams }
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CampaignListComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        dashboardService = TestBed.get(DashboardService);
        dashboardService.setParamsFromRoute({ page: 1 }, 'campaigns');
        fix.detectChanges();
      });
  }));

  it('should show page 1 of campaigns', () => {
    expect(de.query(By.css('prx-paging'))).toBeDefined();
    expect(de.query(By.css('prx-paging button.paging.active')).nativeElement.textContent).toMatch('1');
    expect(de.queryAll(By.css('grove-campaign-card')).length).toEqual(campaignsFixture.length);
  });

  it('should route to params on page change', () => {
    jest.spyOn(comp, 'routeToParams');
    const buttons = de.queryAll(By.css('prx-paging button'));
    for (const button of buttons) {
      if (button.nativeElement.textContent === '2') {
        button.nativeElement.click();
        break;
      }
    }
    expect(comp.routeToParams).toHaveBeenCalledWith({ page: 2 });
  });

  it('sets dashboard params from route query param changes', () => {
    jest.spyOn(dashboardService, 'setParamsFromRoute');
    queryParams.next({ status: 'approved' });
    expect(dashboardService.setParamsFromRoute).toHaveBeenCalledWith({ status: 'approved' }, 'campaigns');
  });
});
