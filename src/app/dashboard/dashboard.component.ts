import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardParams, DashboardService, Facets } from './dashboard.service';

@Component({
  selector: 'grove-dashboard',
  template: `
    <grove-dashboard-filter [params]="routedParams" [facets]="facets" (routeToParams)="routeToParams($event)"></grove-dashboard-filter>

    <div class="list-head">
      <h2>
        <button class="btn-link" (click)="routeToParams({ view: 'flights' })" [disabled]="routedParams.view === 'flights'">
          Flights
        </button>
        |
        <button class="btn-link" (click)="routeToParams({ view: 'campaigns' })" [disabled]="routedParams.view === 'campaigns'">
          Campaigns
        </button>
      </h2>
      <div *ngIf="routedParams.view === 'campaigns'">
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
    <grove-campaign-list
      *ngIf="routedParams.view === 'campaigns'"
      [routedParams]="routedParams"
      (routeToParams)="routeToParams($event)"
    ></grove-campaign-list>
    <grove-flight-table *ngIf="routedParams.view === 'flights'" [routedParams]="routedParams"></grove-flight-table>
  `,
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent {
  @Input() routedParams: DashboardParams;

  constructor(private dashboardService: DashboardService, private router: Router) {}

  get facets(): Facets {
    return this.routedParams.view === 'flights' ? this.dashboardService.flightFacets : this.dashboardService.campaignFacets;
  }

  routeToParams(partialParams: DashboardParams) {
    const {
      view,
      page,
      advertiser,
      podcast,
      status,
      type,
      before,
      after,
      geo,
      zone,
      text,
      representative,
      desc
    } = this.dashboardService.getRouteQueryParams(partialParams);
    this.router.navigate(['/'], {
      queryParams: {
        ...(view && { view }),
        ...(page && { page }),
        ...(advertiser && { advertiser }),
        ...(podcast && { podcast }),
        ...(status && { status }),
        ...(type && { type }),
        ...(before && { before }),
        ...(after && { after }),
        ...(geo && { geo }),
        ...(zone && { zone }),
        ...(text && { text }),
        ...(representative && { representative }),
        ...(desc !== undefined && { desc })
      }
    });
  }
}
