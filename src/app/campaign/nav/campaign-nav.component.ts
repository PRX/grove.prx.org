import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Flight } from 'src/app/dashboard/dashboard.service';
import { Campaign, FlightState } from '../store/models';

@Component({
  selector: 'grove-campaign-nav',
  template: `
    <mat-nav-list>
      <mat-list-item routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }" routerLink="./">Campaign</mat-list-item>
      <mat-list-item
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
        <button class="menuBtn" mat-icon-button disableRipple [matMenuTriggerFor]="flightMenu" [disabled]="!isActiveFlight(flight)">
          <mat-icon aria-label="Campaign Menu">more_vert</mat-icon>
        </button>
      </mat-list-item>
    </mat-nav-list>
    <a class="secondary-link" routerLink="" (click)="createFlight.emit()"><mat-icon>add</mat-icon> Add a Flight</a>
    <mat-menu panelClass="menuPanel" #flightMenu="matMenu">
      <button mat-menu-item (click)="onDuplicate()">
        <mat-icon aria-hidden>file_copy</mat-icon>
        <span>Duplicate Flight</span>
      </button>
      <button class="menuItem--warn" mat-menu-item (click)="onDelete()" *ngIf="canDeleteActiveFlight">
        <mat-icon aria-hidden>delete</mat-icon>
        <span>Delete Flight</span>
      </button>
    </mat-menu>
  `,
  styleUrls: ['./campaign-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignNavComponent {
  @Input() campaign: Campaign;
  @Input() activeFlight: Flight;
  @Input() flights: FlightState[];
  @Input() valid: boolean;
  @Input() changed: boolean;
  @Input() isSaving: boolean;
  @Output() createFlight = new EventEmitter();
  @Output() flightDuplicate = new EventEmitter<Flight>(true);
  @Output() flightDeleteToggle = new EventEmitter(true);

  onDuplicate() {
    this.flightDuplicate.emit(this.activeFlight);
  }

  onDelete() {
    this.flightDeleteToggle.emit();
  }

  isActiveFlight(flight: FlightState) {
    return this.activeFlight && this.activeFlight?.id === flight.localFlight.id;
  }

  get activeFlightHasNoActuals() {
    return this.activeFlight && !this.activeFlight.actualCount;
  }

  get canDeleteActiveFlight() {
    return this.activeFlightHasNoActuals;
  }

  allocationStatusOk(flight: FlightState): boolean {
    return !flight.localFlight.allocationStatus || flight.localFlight.allocationStatus === 'ok';
  }
}
