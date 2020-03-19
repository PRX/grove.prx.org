import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { MockHalService } from 'ngx-prx-styleguide';

import { SharedModule } from '../../shared/shared.module';
import { DashboardService } from '../dashboard.service';
import { DashboardServiceMock } from '../dashboard.service.mock';

import { FlightTableComponent } from './flight-table.component';
import { FlightTableContainerComponent } from './flight-table-container.component';

describe('FlightTableContainerComponent', () => {
  let comp: FlightTableContainerComponent;
  let fix: ComponentFixture<FlightTableContainerComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockDashboardService = new DashboardServiceMock(mockHal);
  let dashboardService: DashboardService;
  const queryParams = new Subject();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatPaginatorModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatTableModule,
        NoopAnimationsModule,
        RouterTestingModule,
        SharedModule
      ],
      declarations: [FlightTableContainerComponent, FlightTableComponent],
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
        fix = TestBed.createComponent(FlightTableContainerComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        dashboardService = TestBed.get(DashboardService);
        dashboardService.setParamsFromRoute({ page: 1, per: 1 }, 'flights');
        fix.detectChanges();
      });
  }));

  it('sets dashboard params from route query param changes', () => {
    jest.spyOn(dashboardService, 'setParamsFromRoute');
    queryParams.next({ sort: 'name' });
    expect(dashboardService.setParamsFromRoute).toHaveBeenCalledWith({ sort: 'name' }, 'flights');
  });
});
