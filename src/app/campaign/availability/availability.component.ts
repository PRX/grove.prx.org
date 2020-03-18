import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Availability, InventoryZone, AvailabilityAllocation } from '../../core';
import { Flight } from '../store/models';

@Component({
  selector: 'grove-availability',
  template: `
    <h2 class="title">Impressions</h2>
    <p *ngIf="cantShowInventory(); else inventory">
      Please select Start and End Dates, Series, and Zones to view inventory.
    </p>
    <ng-template #inventory>
      <grove-goal-form [flight]="flight" [dailyMinimum]="dailyMinimum" (goalChange)="goalChange.emit($event)"></grove-goal-form>
      <ul class="errors" *ngIf="errors as flightErrors">
        <li class="error" *ngFor="let error of flightErrors"><mat-icon>priority_high</mat-icon> {{ error }}</li>
      </ul>
      <mat-divider></mat-divider>
      <section *ngFor="let zone of availabilityZones">
        <h3 class="title">{{ getZoneName(zone.zone) }}</h3>
        <div class="row head">
          <div class="expand"></div>
          <div class="date">Week</div>
          <div class="avail">Available</div>
          <div class="goal">Goal</div>
          <div class="edit"><prx-icon name="lock" size="14px" color="secondary"></prx-icon></div>
        </div>
        <ng-container *ngFor="let week of zone.totals.groups">
          <div
            class="row week"
            [class.row-highlight]="allocationPreviewExceedsAvailable(week)"
            [class.expanded]="isZoneWeekExpanded(zone, week)"
          >
            <div class="expand">
              <button class="btn-link" (click)="toggleZoneWeekExpanded(zone, week)">
                <prx-icon class="icon" name="arrows-alt-v" size="1rem" color="primary"></prx-icon>
              </button>
            </div>
            <div class="date">
              {{ week.startDate | date: 'M/dd' }}
            </div>
            <div class="avail">{{ getAvailable(week) | largeNumber }}</div>
            <div class="goal" [class.preview]="hasAllocationPrevieweAfterChange(week)">
              {{ getAllocationValue(week) | largeNumber }}
            </div>
            <div class="edit">
              <button class="btn-link" aria-label="Edit">
                <prx-icon name="pencil" size="14px" color="primary"></prx-icon>
              </button>
            </div>
            <div class="days-wrapper">
              <div class="days" [cssProps]="{ '--num-days': getDaysForWeek(week) }">
                <div class="row day" [class.row-highlight]="allocationPreviewExceedsAvailable(day)" *ngFor="let day of week.groups">
                  <div class="expand"></div>
                  <div class="date">
                    <span>{{ day.startDate | date: 'M/dd' }}</span>
                  </div>
                  <div class="avail">
                    <span>{{ getAvailable(day) | largeNumber }}</span>
                  </div>
                  <div class="goal" [class.preview]="hasAllocationPrevieweAfterChange(day)">
                    <span>{{ getAllocationValue(day) | largeNumber }}</span>
                  </div>
                  <div class="edit"></div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
        <div class="row totals" [class.row-highlight]="allocationPreviewExceedsAvailable(zone.totals)">
          <div class="expand"></div>
          <div class="date">TOTALS</div>
          <div class="avail">{{ getAvailable(zone.totals) | largeNumber }}</div>
          <div class="goal" [class.preview]="hasAllocationPrevieweAfterChange(zone.totals)">
            {{ getAllocationValue(zone.totals) | largeNumber }}
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

  get errors() {
    const errors = [];

    // Check for allocation preview error.
    // TODO: Updated with discussed "nice_message" when available.
    if (this.allocationPreviewError) {
      errors.push(`Got error ${this.allocationPreviewError.status} from allocation preview.`);
    }

    // Check for flight status message, which should only exist when there was an error.
    if (this.flight.status_message) {
      errors.push(this.flight.status_message);
    }

    return errors;
  }

  getZoneWeekKey({ zone }: Availability, { startDate }: AvailabilityAllocation): string {
    return `${zone}-${startDate}`;
  }

  isZoneWeekExpanded(zone: Availability, week: AvailabilityAllocation): boolean {
    const zoneWeekKey = this.getZoneWeekKey(zone, week);
    return this.zoneWeekExpanded[zoneWeekKey];
  }

  toggleZoneWeekExpanded(zone: Availability, week: AvailabilityAllocation) {
    const zoneWeekKey = this.getZoneWeekKey(zone, week);
    this.zoneWeekExpanded[zoneWeekKey] = !this.zoneWeekExpanded[zoneWeekKey];
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

  hasAllocationPrevieweAfterChange({ allocationPreview }: AvailabilityAllocation): boolean {
    return !!this.changed && allocationPreview >= 0;
  }

  getAllocationValue(period: AvailabilityAllocation): number {
    const { allocated, allocationPreview } = period;
    return this.hasAllocationPrevieweAfterChange(period) ? allocationPreview : allocated;
  }

  getDaysForWeek({ groups }: AvailabilityAllocation): number {
    return groups ? groups.length : 0;
  }

  getZoneName(zoneId: string): string {
    const zone = this.zones && this.zones.find(z => z.id === zoneId);
    return zone && zone.label;
  }

  getAvailable({ allocated, availability }: AvailabilityAllocation): number {
    return allocated + availability;
  }

  allocationPreviewExceedsAvailable(period: AvailabilityAllocation): boolean {
    const { allocationPreview } = period;
    return this.getAvailable(period) < allocationPreview;
  }
}
