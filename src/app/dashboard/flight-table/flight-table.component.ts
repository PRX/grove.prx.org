import { Component, Input, AfterViewInit, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { FlightsDataSource } from './flight-table.data-source';
import { DashboardParams, DashboardService } from '../dashboard.service';

@Component({
  selector: 'grove-flight-table',
  templateUrl: 'flight-table.component.html',
  styleUrls: ['flight-table.component.scss']
})
export class FlightTableComponent implements AfterViewInit, OnInit, OnDestroy {
  // tslint:disable-next-line
  private _routedParams: DashboardParams;
  get routedParams(): DashboardParams {
    return this._routedParams;
  }
  @Input()
  set routedParams(routedParams: DashboardParams) {
    this._routedParams = routedParams;
    if (this.dataSource) {
      this.dataSource.loadFlights(this.routedParams);
    }
  }

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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.dataSource = new FlightsDataSource(this.dashboardService);
    this.dataSource.loadFlights(this.routedParams);
  }

  ngAfterViewInit() {
    this.pageSub = this.paginator.page.subscribe((page: PageEvent) => {
      const params = this.routedParams;
      params.page = page.pageIndex + 1;
      params.per = page.pageSize;
      this.dataSource.loadFlights(params);
    });

    this.sortSub = this.sort.sortChange.subscribe((sort: Sort) => {
      console.log(sort);
      const params = this.routedParams;
      // reset the page index when sorted
      this.paginator.pageIndex = 0;
      params.page = 1;
      params.sort = sort.active;
      params.desc = sort.direction === 'desc';
      this.dataSource.loadFlights(params);
    });
  }

  ngOnDestroy() {
    if (this.pageSub) {
      this.pageSub.unsubscribe();
    }
    if (this.sortSub) {
      this.sortSub.unsubscribe();
    }
  }

  get total(): number {
    return this.dashboardService.flightTotal;
  }
}
