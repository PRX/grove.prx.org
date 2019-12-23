import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Campaign, DashboardService, DashboardParams } from '../dashboard.service';

@Component({
  selector: 'grove-campaign-list',
  template: `
    <ul>
      <li *ngFor="let campaign of campaigns$ | async">
        <grove-campaign-card [campaign]="campaign"></grove-campaign-card>
      </li>
      <ng-container *ngIf="loading$ | async as loading">
        <li *ngFor="let c of loading; let i = index">
          <grove-campaign-card></grove-campaign-card>
        </li>
      </ng-container>
    </ul>
    <hr />
    <prx-paging [currentPage]="currentPage" [totalPages]="totalPer | campaignListTotalPages" (showPage)="routeToParams({ page: $event })">
    </prx-paging>
    <div class="count-of-total">Showing {{ count }} of {{ total }}</div>
  `,
  styleUrls: ['campaign-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignListComponent implements OnInit, OnDestroy {
  @Input() routedParams: DashboardParams;
  campaigns$: Observable<Campaign[]> = this.dashboardService.loadedCampaigns;
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

  setParamsFromRoute() {
    this.routeSub = this.route.queryParams.subscribe((params: Params) => this.dashboardService.setParamsFromRoute(params, 'campaigns'));
  }

  routeToParams(params) {
    this.dashboardService.routeToParams(params);
  }

  get loading$(): Observable<boolean[]> {
    return this.dashboardService.loading;
  }

  get currentPage(): number {
    return this.routedParams.page;
  }

  get count(): number {
    return this.dashboardService.campaignCount;
  }

  get total(): number {
    return this.dashboardService.campaignTotal;
  }

  get totalPer(): { total: number; per: number } {
    return { total: this.dashboardService.campaignTotal, per: this.routedParams.per };
  }
}
