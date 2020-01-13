import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { MockHalService } from 'ngx-prx-styleguide';

import { DashboardService } from '../dashboard.service';
import { DashboardServiceMock } from '../dashboard.service.mock';

import { FlightTableComponent } from './flight-table.component';
import { CampaignTypePipe } from '../campaign-card';

describe('FlightTableComponent', () => {
  let comp: FlightTableComponent;
  let fix: ComponentFixture<FlightTableComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockDashboardService = new DashboardServiceMock(mockHal);
  let dashboardService: DashboardService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatPaginatorModule, MatSortModule, MatTableModule, NoopAnimationsModule, RouterTestingModule],
      declarations: [FlightTableComponent, CampaignTypePipe],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(FlightTableComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        comp.routedParams = { page: 1, per: 1 };
        comp.pageSizeOptions = [1, 25, 50, 100];
        fix.detectChanges();
        dashboardService = TestBed.get(DashboardService);
        dashboardService.setParamsFromRoute({ page: 1, per: 1 }, 'flights');
      });
  }));

  it('advances to the next page', () => {
    jest.spyOn(dashboardService, 'routeToParams');
    comp.paginator.page.emit({ length: 2, pageIndex: 1, pageSize: 1 });
    expect(dashboardService.routeToParams).toHaveBeenCalledWith({ page: 2, per: 1 });
  });

  it('sorts list by table headings', () => {
    jest.spyOn(dashboardService, 'routeToParams');
    comp.sort.sortChange.emit({ direction: 'asc', active: 'name' });
    expect(dashboardService.routeToParams).toHaveBeenCalledWith({ page: 1, direction: 'asc', sort: 'name' });
  });
});
