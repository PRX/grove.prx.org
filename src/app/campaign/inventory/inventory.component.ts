import { Component, Input } from '@angular/core';
import { Flight } from '../../core';

@Component({
  selector: 'grove-inventory',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Inventory</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p *ngIf="flight && (!flight.startAt || !flight.endAt || !flight.set_inventory_uri || !(flight.zones && flight.zones.length))">
          Please select Start and End Dates, Series, and Zones to view inventory.
        </p>
      </mat-card-content>
    </mat-card>
  `
})
export class InventoryComponent {
  @Input() flight: Flight;
}
