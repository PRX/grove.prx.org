import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FlightState } from '../store/models';

@Component({
  selector: 'grove-campaign-nav',
  template: `
    <mat-nav-list>
      <a mat-list-item routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }" routerLink="./">Campaign</a>
      <a
        mat-list-item
        *ngFor="let flight of flights; let i = index"
        [routerLink]="['flight', flight.id]"
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
    <a class="add-flight" [routerLink]="" (click)="createFlight.emit()"><mat-icon>add</mat-icon> Add a Flight</a>
  `,
  styleUrls: ['./campaign-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignNavComponent {
  @Input() flights: FlightState[];
  @Output() createFlight = new EventEmitter();

  statusOk(flight: FlightState): boolean {
    return !flight.localFlight.status || flight.localFlight.status === 'ok';
  }
}
