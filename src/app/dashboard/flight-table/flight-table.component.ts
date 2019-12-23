import { Component, ChangeDetectionStrategy, Input, AfterViewInit, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
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
    'startAt',
    'endAt',
    'totalGoal',
    'campaignStatus',
    'zones',
    'targets',
    'podcast',
    'campaignName',
    'campaignType',
    'repName'
  ];
  dataSource: FlightsDataSource;
  pageSub: Subscription;
  sortSub: Subscription;
  routeSub: Subscription;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dashboardService: DashboardService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.dataSource = new FlightsDataSource(this.dashboardService);
    this.setParamsFromRoute();
  }

  ngAfterViewInit() {
    this.pageSub = this.paginator.page.subscribe((event: PageEvent) => {
      const page = event.pageIndex + 1;
      const per = event.pageSize;
      this.dashboardService.routeToParams({ page, per });
    });

    this.sortSub = this.sort.sortChange.subscribe((event: Sort) => {
      // reset the page index when sorted
      this.paginator.pageIndex = 0;
      const page = 1;
      const sort = event.active;
      const desc = event.direction === 'desc';
      this.dashboardService.routeToParams({ page, sort, desc });
    });
  }

  ngOnDestroy() {
    if (this.pageSub) {
      this.pageSub.unsubscribe();
    }
    if (this.sortSub) {
      this.sortSub.unsubscribe();
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  setParamsFromRoute() {
    this.routeSub = this.route.queryParams.subscribe((params: Params) => this.dashboardService.setParamsFromRoute(params, 'flights'));
  }

  get total(): number {
    return this.dashboardService.flightTotal;
  }
}
