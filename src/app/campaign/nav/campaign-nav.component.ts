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
        [class.error]="!allocationStatusOk(flight)"
      >
        <span matLine>{{ flight.localFlight?.name }}</span>
        <mat-icon color="warn" *ngIf="!allocationStatusOk(flight)">priority_high</mat-icon>
      </a>
    </mat-nav-list>
    <a class="secondary-link" routerLink="" (click)="createFlight.emit()"><mat-icon>add</mat-icon> Add a Flight</a>
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

  allocationStatusOk(flight: FlightState): boolean {
    return !flight.localFlight.allocationStatus || flight.localFlight.allocationStatus === 'ok';
  }
}
