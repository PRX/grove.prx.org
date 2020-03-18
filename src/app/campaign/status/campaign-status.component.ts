import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardService, DashboardRouteParams } from '../../dashboard/dashboard.service';

@Component({
  selector: 'grove-campaign-status',
  template: `
    <prx-status-bar>
      <a prx-status-bar-link routerLink="/" [queryParams]="queryParams$ | async">
        <prx-status-bar-icon name="chevron-left" aria-label="Return To Home"></prx-status-bar-icon>
      </a>
      <prx-status-bar-text bold uppercase>Edit Campaign</prx-status-bar-text>
      <prx-status-bar-text italic stretch>{{ campaignName }}</prx-status-bar-text>
      <prx-button [working]="isSaving" [disabled]="!valid || !changed" (click)="onSave()">Save</prx-button>
    </prx-status-bar>
  `,
  styleUrls: ['./campaign-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignStatusComponent {
  @Input() campaignName: string;
  @Input() valid: boolean;
  @Input() changed: boolean;
  @Input() isSaving: boolean;
  @Output() save = new EventEmitter();

  constructor(private dashboardService: DashboardService) {}

  get queryParams$(): Observable<DashboardRouteParams> {
    return this.dashboardService.getRouteQueryParams({});
  }

  onSave() {
    this.save.emit();
  }
}
