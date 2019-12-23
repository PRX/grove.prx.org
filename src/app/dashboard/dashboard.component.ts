import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { DashboardParams, DashboardRouteParams, DashboardService, Facets } from './dashboard.service';

@Component({
  selector: 'grove-dashboard',
  template: `
    <ng-container *ngIf="routedParams$ | async as routedParams">
      <grove-dashboard-filter [params]="routedParams" [facets]="facets$ | async"></grove-dashboard-filter>

      <div class="tabs">
        <nav mat-tab-nav-bar *ngIf="queryParams$ | async as queryParams">
          <a mat-tab-link routerLink="/flights" [queryParams]="queryParams" [active]="routedParams?.view === 'flights'">
            Flights
          </a>
          <a mat-tab-link routerLink="/campaigns" [queryParams]="queryParams" [active]="routedParams?.view === 'campaigns'">
            Campaigns
          </a>
        </nav>
        <div *ngIf="routedParams?.view === 'campaigns'">
          <input
            type="checkbox"
            class="updown-toggle"
            id="desc"
            [checked]="routedParams?.desc"
            (click)="routeToParams({ desc: !routedParams.desc })"
          />
          <label for="desc"></label>
        </div>
      </div>

      <router-outlet></router-outlet>
    </ng-container>
  `,
  styleUrls: ['dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  constructor(private dashboardService: DashboardService, private route: ActivatedRoute) {}

  get routedParams$(): Observable<DashboardParams> {
    return this.dashboardService.params;
  }

  get facets$(): Observable<Facets> {
    return this.dashboardService.params.pipe(
      pluck('view'),
      map(view => (view === 'flights' ? this.dashboardService.flightFacets : this.dashboardService.campaignFacets))
    );
  }

  routeToParams(partialParams: DashboardParams) {
    this.dashboardService.routeToParams(partialParams);
  }

  get queryParams$(): Observable<DashboardRouteParams> {
    return this.dashboardService.getRouteQueryParams({});
  }
}
