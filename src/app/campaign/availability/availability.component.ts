import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Flight, Availability } from '../../core';

@Component({
  selector: 'grove-availability',
  template: `
    <h2>Inventory</h2>
    <p *ngIf="flight && (!flight.startAt || !flight.endAt || !flight.set_inventory_uri || !(flight.zones && flight.zones.length))">
      Please select Start and End Dates, Series, and Zones to view inventory.
    </p>
    <div *ngFor="let avail of availability">
      <h3>{{avail.zone}}</h3>
      <div>
        <div class="row head">
          <div class="date">Week</div>
          <div class="avail">Available</div>
          <div class="goal">Goal</div>
        </div>
        <ng-container *ngFor="let week of avail.availabilityAllocationDays">
          <div class="row">
            <div class="date">
              <button class="btn-link" (click)="toggleZoneWeekExpanded(avail.zone, week.date)">{{ week.date | date:'M/dd' }}</button>
            </div>
            <div class="avail">{{ (week.allocated + week.availability) | largeNumber }}</div>
            <div class="goal"></div>
            <div class="edit"></div>
          </div>
          <ng-container *ngIf="zoneWeekExpanded[avail.zone + '-' + week.date]">
            <div class="row expand" *ngFor="let day of week.days">
              <div class="date"><span>&mdash;</span><span>{{ day.date | date:'M/dd' }}</span></div>
              <div class="avail"><span>&mdash;</span><span>{{ (day.allocated + day.availability) | largeNumber }}</span></div>
              <div class="goal"></div>
              <div class="edit"></div>
            </div>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['availability.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailabilityComponent {
  @Input() flight: Flight;
  @Input() availability: Availability[];
  // tslint:disable-next-line: variable-name
  zoneWeekExpanded = {};

  toggleZoneWeekExpanded(zone: string, date: string) {
    this.zoneWeekExpanded[`${zone}-${date}`] = !this.zoneWeekExpanded[`${zone}-${date}`];
  }
}
