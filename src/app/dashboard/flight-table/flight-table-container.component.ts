import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { DashboardService } from '../dashboard.service';

@Component({
  template: `
    <div class="spinner-container" *ngIf="loading$ | async; else flightTable">
      <mat-spinner></mat-spinner>
    </div>
    <ng-template #flightTable>
      <grove-flight-table [routedParams]="routedParams$ | async"></grove-flight-table>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightTableContainerComponent implements OnInit, OnDestroy {
  routedParams$ = this.dashboardService.params;
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

  get loading$(): Observable<boolean> {
    return this.dashboardService.flightsLoading;
  }

  setParamsFromRoute() {
    this.routeSub = this.route.queryParams.subscribe((params: Params) => this.dashboardService.setParamsFromRoute(params, 'flights'));
  }
}
