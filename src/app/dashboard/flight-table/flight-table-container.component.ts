import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DashboardService } from '../dashboard.service';

@Component({
  template: `
    <grove-flight-table [routedParams]="routedParams$ | async"></grove-flight-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightTableContainerComponent {
  routedParams$ = this.dashboardService.params;

  constructor(private dashboardService: DashboardService) {}
}
