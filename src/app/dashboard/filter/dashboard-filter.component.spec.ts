import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, MatSelectModule } from '@angular/material';
import { MockHalService } from 'ngx-prx-styleguide';
import { SharedModule } from '../../shared/shared.module';

import { DashboardService } from '../dashboard.service';
import { DashboardServiceMock, facets } from '../dashboard.service.mock';

import { DashboardFilterComponent, FilterFacetComponent, FilterTextComponent, FilterDateComponent } from '.';

describe('DashboardFilterComponent', () => {
  let comp: DashboardFilterComponent;
  let fix: ComponentFixture<DashboardFilterComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockDashboardService = new DashboardServiceMock(mockHal);
  let dashboardService: DashboardService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        MatSelectModule,
        NoopAnimationsModule
      ],
      declarations: [DashboardFilterComponent, FilterFacetComponent, FilterTextComponent, FilterDateComponent],
      providers: [
        MatDatepickerModule,
        {
          provide: DashboardService,
          useValue: mockDashboardService
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(DashboardFilterComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        dashboardService = TestBed.get(DashboardService);
        dashboardService.setParamsFromRoute({ page: 1, per: 2 }, 'flights');
        comp.params = { page: 1, per: 2 };
        comp.facets = facets;
        fix.detectChanges();
      });
  }));

  it('should route to page 1 on filter', () => {
    jest.spyOn(dashboardService, 'routeToParams');
    comp.routeToParams({ page: 2 });
    expect(dashboardService.routeToParams).toHaveBeenCalledWith({ page: 1 });
  });
});
