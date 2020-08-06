import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardService, DashboardRouteParams } from '../../dashboard/dashboard.service';
import { ModalService } from 'ngx-prx-styleguide';
import { FlightState } from '../store/models';

@Component({
  selector: 'grove-campaign-status',
  template: `
    <prx-status-bar>
      <a prx-status-bar-link routerLink="/" [queryParams]="queryParams$ | async">
        <prx-status-bar-icon name="chevron-left" aria-label="Return To Home"></prx-status-bar-icon>
      </a>
      <prx-status-bar-text bold uppercase>Edit Campaign</prx-status-bar-text>
      <prx-status-bar-text italic stretch>{{ campaignName }}</prx-status-bar-text>
      <button class="menuBtn" mat-icon-button disableRipple [matMenuTriggerFor]="campaignMenu">
        <mat-icon aria-label="Campaign Menu">more_vert</mat-icon>
      </button>
      <prx-button [working]="isSaving" [disabled]="!valid || !changed" (click)="onSave()">Save</prx-button>
    </prx-status-bar>
    <mat-menu panelClass="menuPanel" #campaignMenu="matMenu">
      <grove-campaign-report [campaignName]="campaignName" [flights]="flights" [reportData]="reportData"></grove-campaign-report>
      <button mat-menu-item [disabled]="!canDuplicate" (click)="onDuplicate()">
        <mat-icon aria-hidden>file_copy</mat-icon>
        <span>Duplicate</span>
      </button>
      <button class="menuItem--warn" mat-menu-item [disabled]="!canDelete" (click)="onDelete()" *ngIf="hasNoActuals">
        <mat-icon aria-hidden>delete</mat-icon>
        <span>Delete</span>
      </button>
    </mat-menu>
  `,
  styleUrls: ['./campaign-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignStatusComponent {
  @Input() campaignName: string;
  @Input() valid: boolean;
  @Input() changed: boolean;
  @Input() isSaving: boolean;
  @Input() actuals: number;
  @Input() flights: FlightState[];
  @Input() reportData: any[][];
  @Output() save = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() duplicate = new EventEmitter();

  constructor(private dashboardService: DashboardService, public modal: ModalService) {}

  get canDuplicate(): boolean {
    return this.valid && !this.changed && !this.isSaving;
  }

  get canDelete(): boolean {
    return !this.isSaving;
  }

  get hasNoActuals(): boolean {
    return !this.actuals;
  }

  get queryParams$(): Observable<DashboardRouteParams> {
    return this.dashboardService.getRouteQueryParams({});
  }

  onSave() {
    this.save.emit();
  }

  onDuplicate() {
    this.duplicate.emit();
  }

  onDelete() {
    enum options {
      DELETE = 'Delete Campaign',
      CANCEL = 'Cancel'
    }

    this.modal.show({
      title: 'Are you sure?',
      body: 'Deleteing a campaign is permanent and can not be undone.',
      primaryButton: options.DELETE,
      secondaryButton: options.CANCEL,
      buttonCallback: (result: options) => {
        switch (result) {
          case options.DELETE:
            this.delete.emit();
            break;
          default:
          // Do Nothing.
        }
      }
    });
  }
}
