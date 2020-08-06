import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Flight, InventoryRollup, InventoryZone } from '../store/models';

@Component({
  selector: 'grove-inventory',
  template: `
    <div *ngIf="cantShowInventory(); else inventory">
      <h2 class="title">Impressions</h2>
      <p>Please select Start and End Dates, Series, and Zones to view inventory.</p>
    </div>
    <ng-template #inventory>
      <grove-goal-form></grove-goal-form>
      <ul class="errors" *ngIf="errors as flightErrors">
        <li class="error" *ngFor="let error of flightErrors"><mat-icon>priority_high</mat-icon> {{ error }}</li>
      </ul>
      <mat-divider></mat-divider>
      <section>
        <h3 class="title">{{ zoneNames }}</h3>
        <grove-inventory-table
          *ngIf="rollup"
          [flight]="flight"
          [rollup]="rollup"
          [isPreview]="isPreview"
          [isLoading]="isLoading"
        ></grove-inventory-table>
      </section>
    </ng-template>
  `,
  styleUrls: ['inventory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryComponent {
  @Input() flight: Flight;
  @Input() zones: InventoryZone[];
  @Input() rollup: InventoryRollup;
  @Input() isPreview: boolean;
  @Input() isLoading: boolean;
  @Input() previewError: any;
  @Output() goalChange = new EventEmitter<Flight>();
  zoneWeekExpanded = {};

  get errors() {
    return [this.decodedPreviewError, this.flight.allocationStatusMessage].filter(error => !!error);
  }

  // TODO: Updated with discussed "nice_message" when available.
  get decodedPreviewError(): string {
    if (this.previewError && this.previewError.body && this.previewError.body.message) {
      return this.previewError.body.message;
    } else {
      return this.previewError;
    }
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
      !(this.flight.zones && this.flight.zones.filter(z => z.id).length)
    );
  }
}
