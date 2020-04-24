import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Campaign, FlightState } from '../store/models';

@Component({
  selector: 'grove-campaign-nav',
  template: `
    <mat-nav-list>
      <a mat-list-item routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }" routerLink="./">Campaign</a>
      <a
        mat-list-item
        *ngFor="let flight of flights; let i = index"
        [routerLink]="['flight', flight?.localFlight?.id]"
        routerLinkActive="active-link"
        [class.deleted-flight]="flight.softDeleted"
        [class.changed]="flight.changed"
        [class.valid]="flight.valid"
        [class.invalid]="!flight.valid"
        [class.error]="!statusOk(flight)"
      >
        <span matLine>{{ flight.localFlight?.name }}</span>
        <mat-icon color="warn" *ngIf="!statusOk(flight)">priority_high</mat-icon>
      </a>
    </mat-nav-list>
    <a class="secondary-link" routerLink="" (click)="createFlight.emit()"><mat-icon>add</mat-icon> Add a Flight</a>
    <ng-container *ngIf="valid && !changed && !isSaving; else disabledDuplicate">
      <a class="secondary-link" routerLink="/campaign/new" [state]="dupCampaignState"><mat-icon>file_copy</mat-icon>Duplicate Campaign</a>
    </ng-container>
    <ng-template #disabledDuplicate>
      <a class="secondary-link disabled"><mat-icon>file_copy</mat-icon>Duplicate Campaign</a>
    </ng-template>
  `,
  styleUrls: ['./campaign-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignNavComponent {
  @Input() campaign: Campaign;
  @Input() flights: FlightState[];
  @Input() valid: boolean;
  @Input() changed: boolean;
  @Input() isSaving: boolean;
  @Output() createFlight = new EventEmitter();

  statusOk(flight: FlightState): boolean {
    return !flight.localFlight.status || flight.localFlight.status === 'ok';
  }

  get dupCampaignState(): { campaign; flights } {
    return {
      campaign: this.campaign,
      flights: this.flights
        .filter(flight => !flight.softDeleted)
        .map(flight => {
          // NOTE: router does not want to serialize Moment, so passing thru valueOf, startAt/endAt are removed in reducer
          return { ...flight.localFlight, startAt: flight.localFlight.startAt.valueOf(), endAt: flight.localFlight.endAt.valueOf() };
        })
    };
  }
}
