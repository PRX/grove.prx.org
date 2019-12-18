import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
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
    <prx-paging
      [currentPage]="currentPage"
      [totalPages]="totalPer | campaignListTotalPages"
      (showPage)="routeToParams.emit({ page: $event })"
    >
    </prx-paging>
    <div class="count-of-total">Showing {{ count }} of {{ total }}</div>
  `,
  styleUrls: ['campaign-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignListComponent {
  // tslint:disable-next-line
  private _routedParams: DashboardParams;
  get routedParams(): DashboardParams {
    return this._routedParams;
  }
  @Input()
  set routedParams(routedParams: DashboardParams) {
    this._routedParams = routedParams;
    this.dashboardService.loadCampaignList(this.routedParams);
  }
  @Output() routeToParams = new EventEmitter<DashboardParams>();
  campaigns$: Observable<Campaign[]> = this.dashboardService.loadedCampaigns;

  constructor(private dashboardService: DashboardService) {}

  get loading$(): Observable<boolean[]> {
    return this.dashboardService.loading;
  }

  get currentPage(): number {
    return this.dashboardService.params.page;
  }

  get count(): number {
    return this.dashboardService.campaignCount;
  }

  get total(): number {
    return this.dashboardService.campaignTotal;
  }

  get totalPer(): { total: number; per: number } {
    return { total: this.dashboardService.campaignTotal, per: this.dashboardService.params.per };
  }
}
