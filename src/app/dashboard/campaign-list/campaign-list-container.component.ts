import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DashboardService } from '../dashboard.service';

@Component({
  template: `
    <grove-campaign-list [routedParams]="routedParams$ | async"></grove-campaign-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignListContainerComponent {
  routedParams$ = this.dashboardService.params;

  constructor(private dashboardService: DashboardService) {}
}
