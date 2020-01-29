import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Flight, Availability, InventoryZone } from '../../core';

@Component({
  selector: 'grove-availability',
  template: `
    <h2>Impressions</h2>
    <p *ngIf="cantShowInventory(); else inventory">
      Please select Start and End Dates, Series, and Zones to view inventory.
    </p>
    <ng-template #inventory>
      <grove-goal-form [flight]="flight" [dailyMinimum]="dailyMinimum" (goalChange)="goalChange.emit($event)"></grove-goal-form>
      <ul class="errors" *ngIf="getFlightErrors()">
        <li class="error" *ngFor="let error of errors"><mat-icon>priority_high</mat-icon> {{error}}</li>
      </ul>
      <mat-divider></mat-divider>
      <section *ngFor="let zone of availabilityZones">
        <h3>{{ getZoneName(zone.zone) }}</h3>
        <div class="row head">
          <div class="date">Week</div>
          <div class="avail">Available</div>
          <div class="goal">Goal</div>
          <div class="edit"><prx-icon name="lock" size="14px" color="secondary"></prx-icon></div>
        </div>
        <ng-container *ngFor="let week of zone.totals.groups">
          <div class="row" [class.row-highlight]="week.allocated + week.availability < week.allocationPreview">
            <div class="date">
              <button
                class="btn-link"
                (click)="toggleZoneWeekExpanded(zone.zone, week.startDate)"
                (mouseover)="toggleZoneWeekHover(zone.zone, week.startDate)"
                (mouseleave)="toggleZoneWeekHover(zone.zone, week.startDate)"
              >
                <prx-icon
                  [class.hide]="!(zoneWeekHover[zone.zone + '-' + week.startDate] || zoneWeekExpanded[zone.zone + '-' + week.startDate])"
                  name="arrows-alt-v"
                  size="6px"
                  color="primary"
                >
                </prx-icon>
                {{ week.startDate | date: 'M/dd' }}
              </button>
            </div>
            <div class="avail">{{ week.allocated + week.availability | largeNumber }}</div>
            <div class="goal" [class.preview]="changed && week.allocationPreview >= 0">
              {{ changed && week.allocationPreview >= 0 ? (week.allocationPreview | largeNumber) : (week.allocated | largeNumber) }}
              <span *ngIf="changed && week.allocationPreview >= 0">*</span>
            </div>
            <div class="edit">
              <button class="btn-link" aria-label="Edit">
                <prx-icon name="pencil" size="14px" color="primary"></prx-icon>
              </button>
            </div>
          </div>
          <ng-container *ngIf="zoneWeekExpanded[zone.zone + '-' + week.startDate]">
            <div
              class="row expand"
              [class.row-highlight]="day.allocated + day.availability < day.allocationPreview"
              *ngFor="let day of week.groups"
            >
              <div class="date">
                <span>&mdash;</span><span>{{ day.startDate | date: 'M/dd' }}</span>
              </div>
              <div class="avail">
                <span>&mdash;</span><span>{{ day.allocated + day.availability | largeNumber }}</span>
              </div>
              <div class="goal" [class.preview]="changed && day.allocationPreview >= 0">
                <span>&mdash;</span>
                <span>
                  {{ changed && day.allocationPreview >= 0 ? (day.allocationPreview | largeNumber) : (day.allocated | largeNumber) }}
                  <span *ngIf="changed && day.allocationPreview >= 0">*</span>
                </span>
              </div>
              <div class="edit"></div>
            </div>
          </ng-container>
        </ng-container>
        <div class="row totals" [class.row-highlight]="zone.totals.allocated + zone.totals.availability < zone.totals.allocationPreview">
          <div class="date">TOTALS</div>
          <div class="avail">{{ zone.totals.allocated + zone.totals.availability | largeNumber }}</div>
          <div class="goal" [class.preview]="changed && zone.totals.allocationPreview >= 0">
            {{
              changed && zone.totals.allocationPreview >= 0
                ? (zone.totals.allocationPreview | largeNumber)
                : (zone.totals.allocated | largeNumber)
            }}
            <span *ngIf="changed && zone.totals.allocationPreview >= 0">*</span>
          </div>
          <div class="edit"></div>
        </div>
      </section>
    </ng-template>
  `,
  styleUrls: ['availability.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailabilityComponent {
  @Input() flight: Flight;
  @Input() changed: boolean;
  @Input() zones: InventoryZone[];
  @Input() availabilityZones: Availability[];
  @Input() allocationPreviewError: any;
  @Input() dailyMinimum: number;
  @Output() goalChange = new EventEmitter<{ flight: Flight; dailyMinimum: number }>();
  zoneWeekExpanded = {};
  zoneWeekHover = {};
  errors = [];

  toggleZoneWeekExpanded(zone: string, date: string) {
    this.zoneWeekExpanded[`${zone}-${date}`] = !this.zoneWeekExpanded[`${zone}-${date}`];
  }

  toggleZoneWeekHover(zone: string, date: string) {
    this.zoneWeekHover[`${zone}-${date}`] = !this.zoneWeekHover[`${zone}-${date}`];
  }

  cantShowInventory() {
    return (
      this.flight &&
      (!this.flight.startAt || !this.flight.endAt || !this.flight.set_inventory_uri || !(this.flight.zones && this.flight.zones.length))
    );
  }

  getFlightErrors() {
    this.errors = [];

    if (this.allocationPreviewError) {
      this.errors.push(`Got error ${ this.allocationPreviewError.status } from allocation preview.`);
    }

    if (this.flight.status_message) {
      this.errors.push(this.flight.status_message);
    }

    return !!this.errors.length;
  }

  getZoneName(zoneId: string): string {
    const zone = this.zones && this.zones.find(z => z.id === zoneId);
    return zone && zone.label;
  }
}
