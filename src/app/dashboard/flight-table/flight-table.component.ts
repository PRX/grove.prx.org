import { Component, ChangeDetectionStrategy, Input, AfterViewInit, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { FlightsDataSource } from './flight-table.data-source';
import { DashboardParams, DashboardService } from '../dashboard.service';

@Component({
  selector: 'grove-flight-table',
  templateUrl: 'flight-table.component.html',
  styleUrls: ['flight-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() routedParams: DashboardParams;

  displayedColumns: string[] = [
    'name',
    'advertiser',
    'start_at',
    'end_at',
    'total_goal',
    'campaign_status',
    'zone',
    'geo',
    'podcast',
    'campaign_name',
    'campaign_type',
    'campaign_representative'
  ];
  dataSource: FlightsDataSource;
  pageSub: Subscription;
  sortSub: Subscription;
  routeSub: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dataSource = new FlightsDataSource(this.dashboardService);
  }

  ngAfterViewInit() {
    this.routeOnPageEvent();
    this.routeOnSortEvent();
  }

  ngOnDestroy() {
    if (this.pageSub) {
      this.pageSub.unsubscribe();
    }
    if (this.sortSub) {
      this.sortSub.unsubscribe();
    }
  }

  routeOnPageEvent() {
    this.pageSub = this.paginator.page.subscribe((event: PageEvent) => {
      const page = event.pageIndex + 1;
      const per = event.pageSize;
      this.dashboardService.routeToParams({ page, per });
    });
  }

  routeOnSortEvent() {
    this.sortSub = this.sort.sortChange.subscribe((event: Sort) => {
      // reset the page index when sorted
      this.paginator.pageIndex = 0;
      const page = 1;
      const sort = event.active;
      const desc = event.direction === 'desc';
      this.dashboardService.routeToParams({ page, sort, desc });
    });
  }

  get total(): number {
    return this.dashboardService.flightTotal;
  }
}
