import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Flight, Availability, InventoryZone } from '../../core';

@Component({
  selector: 'grove-availability',
  template: `
    <h2>Impressions</h2>
    <p *ngIf="flight && (!flight.startAt || !flight.endAt || !flight.set_inventory_uri || !(flight.zones && flight.zones.length))">
      Please select Start and End Dates, Series, and Zones to view inventory.
    </p>
    <section *ngFor="let zone of availabilityZones">
      <h3>{{ getZoneName(zone.zone) }}</h3>
      <div class="row head">
        <div class="date">Week</div>
        <div class="avail">Available</div>
        <div class="goal">Goal</div>
      </div>
      <ng-container *ngFor="let week of zone.totals.groups">
        <div class="row">
          <div class="date">
            <button class="btn-link" (click)="toggleZoneWeekExpanded(zone.zone, week.startDate)">{{ week.startDate | date:'M/dd' }}</button>
          </div>
          <div class="avail">{{ (week.allocated + week.availability) | largeNumber }}</div>
          <div class="goal"></div>
          <div class="edit"></div>
        </div>
        <ng-container *ngIf="zoneWeekExpanded[zone.zone + '-' + week.startDate]">
          <div class="row expand" *ngFor="let day of week.groups">
            <div class="date"><span>&mdash;</span><span>{{ day.startDate | date:'M/dd' }}</span></div>
            <div class="avail"><span>&mdash;</span><span>{{ (day.allocated + day.availability) | largeNumber }}</span></div>
            <div class="goal"></div>
            <div class="edit"></div>
          </div>
        </ng-container>
      </ng-container>
      <div class="row totals">
        <div class="date">TOTALS</div>
        <div class="avail">{{ (zone.totals.allocated + zone.totals.availability) | largeNumber }}</div>
        <div class="goal"></div>
        <div class="edit"></div>
      </div>
    </section>
  `,
  styleUrls: ['availability.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailabilityComponent {
  @Input() flight: Flight;
  @Input() zones: InventoryZone[];
  @Input() availabilityZones: Availability[];
  zoneWeekExpanded = {};

  toggleZoneWeekExpanded(zone: string, date: string) {
    this.zoneWeekExpanded[`${zone}-${date}`] = !this.zoneWeekExpanded[`${zone}-${date}`];
  }

  getZoneName(zoneId: string): string {
    const zone = this.zones && this.zones.find(z => z.id === zoneId);
    return zone && zone.label;
  }
}
