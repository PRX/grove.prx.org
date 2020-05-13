import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { InventoryZone } from '../../core';
import { Flight, InventoryRollup } from '../store/models';

@Component({
  selector: 'grove-inventory',
  template: `
    <div *ngIf="cantShowInventory(); else inventory">
      <h2 class="title">Impressions</h2>
      <p>Please select Start and End Dates, Series, and Zones to view inventory.</p>
    </div>
    <ng-template #inventory>
      <grove-goal-form [flight]="flight" (goalChange)="goalChange.emit($event)"></grove-goal-form>
      <ul class="errors" *ngIf="errors as flightErrors">
        <li class="error" *ngFor="let error of flightErrors"><mat-icon>priority_high</mat-icon> {{ error }}</li>
      </ul>
      <mat-divider></mat-divider>
      <section>
        <h3 class="title">{{ zoneNames }}</h3>
        <grove-inventory-table *ngIf="rollup" [flight]="flight" [rollup]="rollup" [isPreview]="isPreview"></grove-inventory-table>
      </section>
    </ng-template>
  `,
  styleUrls: ['inventory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent {
  @Input() flight: Flight;
  @Input() changed: boolean;
  @Input() zones: InventoryZone[];
  @Input() rollup: InventoryRollup;
  @Input() isPreview: boolean;
  @Input() previewError: any;
  @Output() goalChange = new EventEmitter<Flight>();
  zoneWeekExpanded = {};

  get errors() {
    return [
      // allocation preview error
      // TODO: Updated with discussed "nice_message" when available.
      this.previewError && this.previewError.body && this.previewError.body.message,
      // flight status message, should only exist when there was an error
      this.flight.status_message
    ].filter(error => !!error);
  }

  getZoneName(zoneId: string): string {
    const zone = this.zones && this.zones.find(z => z.id === zoneId);
    return zone && zone.label;
  }

  get zoneNames(): string {
    return (
      this.flight &&
      this.flight.zones &&
      this.flight.zones.filter(id => id).length &&
      this.flight.zones.map(zone => this.getZoneName(zone.id)).join(', ')
    );
  }

  cantShowInventory() {
    return (
      !this.flight ||
      !this.flight.startAt ||
      !this.flight.endAt ||
      !this.flight.set_inventory_uri ||
      !(this.flight.zones && this.flight.zones.length)
    );
  }
}
