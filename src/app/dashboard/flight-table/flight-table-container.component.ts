import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { DashboardService } from '../dashboard.service';

@Component({
  template: `
    <div *ngIf="error$ | async as error; else flights">
      {{ error }}
    </div>
    <ng-template #flights>
      <div class="spinner-container" *ngIf="loading$ | async; else flightTable">
        <mat-spinner></mat-spinner>
      </div>
      <ng-template #flightTable>
        <grove-flight-table
          [routedParams]="routedParams$ | async"
          [totalActuals]="totalActuals$ | async"
          [totalGoals]="totalGoals$ | async"
        ></grove-flight-table>
      </ng-template>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightTableContainerComponent implements OnInit, OnDestroy {
  routedParams$ = this.dashboardService.params;
  totalActuals$ = this.dashboardService.actualsTotal;
  totalGoals$ = this.dashboardService.goalsTotal;
  routeSub: Subscription;

  constructor(private dashboardService: DashboardService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.setParamsFromRoute();
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  get error$(): Observable<Error> {
    return this.dashboardService.error;
  }

  get loading$(): Observable<boolean> {
    return this.dashboardService.flightsLoading;
  }

  setParamsFromRoute() {
    this.routeSub = this.route.queryParams.subscribe((params: Params) => this.dashboardService.setParamsFromRoute(params, 'flights'));
  }
}
