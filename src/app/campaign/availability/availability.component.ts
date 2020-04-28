import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { InventoryZone } from '../../core';
import { Flight, AvailabilityRollup, AvailabilityWeeklyRollup, AvailabilityParams, InventoryNumbers } from '../store/models';
import { getMidnightUTC } from '../store/selectors';

@Component({
  selector: 'grove-availability',
  template: `
    <h2 class="title">Impressions</h2>
    <p *ngIf="cantShowInventory(); else inventory">
      Please select Start and End Dates, Series, and Zones to view inventory.
    </p>
    <ng-template #inventory>
      <grove-goal-form [flight]="flight" (goalChange)="goalChange.emit($event)"></grove-goal-form>
      <ul class="errors" *ngIf="errors as flightErrors">
        <li class="error" *ngFor="let error of flightErrors"><mat-icon>priority_high</mat-icon> {{ error }}</li>
      </ul>
      <mat-divider></mat-divider>
      <section *ngFor="let rollup of rollups">
        <h3 class="title">{{ getZoneName(rollup.params.zone) }}</h3>
        <div class="row head">
          <div class="expand"></div>
          <div class="date">Week</div>
          <div class="avail">Available</div>
          <div class="goal">Allocated</div>
          <div class="goal">Actual</div>
          <div class="edit"><prx-icon name="lock" size="14px" color="secondary"></prx-icon></div>
        </div>
        <ng-container *ngFor="let week of rollup.weeks">
          <div
            class="row week"
            [class.row-highlight]="allocationPreviewExceedsAvailable(week.numbers)"
            [class.expanded]="isZoneWeekExpanded(rollup, week)"
            [class.current-date]="showAsCurrentWeek(rollup, week)"
            [class.past-date]="showAsPastDate(week.endDate)"
          >
            <div class="expand">
              <button class="btn-link" (click)="toggleZoneWeekExpanded(rollup, week)">
                <prx-icon class="icon" name="arrows-alt-v" size="1rem" color="primary"></prx-icon>
              </button>
            </div>
            <div class="date">
              {{ week.startDate | date: 'M/dd':'+0000' }}
            </div>
            <div>{{ week.numbers.availability | largeNumber }}</div>
            <div [class.preview]="hasAllocationPreviewAfterChange(week.numbers.allocationPreview)">
              {{ getAllocationValue(week.numbers) | largeNumber }}
            </div>
            <div>
              {{ showActualsValue(week.startDate) ? (week.numbers.actuals | largeNumber) : '&mdash;' }}
            </div>
            <div class="edit">
              <button class="btn-link" aria-label="Edit">
                <prx-icon name="pencil" size="14px" color="primary"></prx-icon>
              </button>
            </div>
            <div class="days-wrapper">
              <div class="days" [cssProps]="{ '--num-days': week?.days?.length }">
                <div
                  *ngFor="let day of week.days"
                  class="row day"
                  [class.row-highlight]="allocationPreviewExceedsAvailable(day.numbers)"
                  [class.current-date]="showAsCurrentDate(day.date)"
                  [class.past-date]="showAsPastDate(day.date)"
                >
                  <div class="expand"></div>
                  <div class="date">
                    <span>{{ day.date | date: 'M/dd':'+0000' }}</span>
                  </div>
                  <div class="avail">
                    <span>{{ day.numbers.availability | largeNumber }}</span>
                  </div>
                  <div class="goal" [class.preview]="hasAllocationPreviewAfterChange(day.numbers.allocationPreview)">
                    <span>{{ getAllocationValue(day.numbers) | largeNumber }}</span>
                  </div>
                  <div>
                    {{ showActualsValue(day.date) ? (day.numbers.actuals | largeNumber) : '&mdash;' }}
                  </div>
                  <div class="edit"></div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
        <div class="row totals" [class.row-highlight]="allocationPreviewExceedsAvailable(rollup.totals)">
          <div class="expand"></div>
          <div class="date">TOTALS</div>
          <div>{{ rollup.totals.availability | largeNumber }}</div>
          <div [class.preview]="hasAllocationPreviewAfterChange(rollup.totals.allocationPreview)">
            {{ getAllocationValue(rollup.totals) | largeNumber }}
          </div>
          <div>
            {{ showActualsValue(rollup.params.startDate) ? rollup.totals.actuals : '&mdash;' }}
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
  @Input() rollups: AvailabilityRollup[];
  @Input() allocationPreviewError: any;
  @Output() goalChange = new EventEmitter<Flight>();
  zoneWeekExpanded = {};

  get errors() {
    return [
      // allocation preview error
      // TODO: Updated with discussed "nice_message" when available.
      this.allocationPreviewError && this.allocationPreviewError.body && this.allocationPreviewError.body.message,
      // flight status message, should only exist when there was an error
      this.flight.status_message
    ].filter(error => !!error);
  }

  getZoneWeekKey({ zone }: AvailabilityParams, { startDate }: AvailabilityWeeklyRollup): string {
    return `${zone}-${startDate.toISOString().slice(0, 10)}`;
  }

  isZoneWeekExpanded(rollup: AvailabilityRollup, week: AvailabilityWeeklyRollup): boolean {
    const zoneWeekKey = this.getZoneWeekKey(rollup.params, week);
    return this.zoneWeekExpanded[zoneWeekKey];
  }

  toggleZoneWeekExpanded(rollup: AvailabilityRollup, week: AvailabilityWeeklyRollup) {
    const zoneWeekKey = this.getZoneWeekKey(rollup.params, week);
    this.zoneWeekExpanded[zoneWeekKey] = !this.zoneWeekExpanded[zoneWeekKey];
  }

  showAsCurrentWeek(rollup: AvailabilityRollup, week: AvailabilityWeeklyRollup): boolean {
    return !this.isZoneWeekExpanded(rollup, week) && week.startDate.valueOf() <= Date.now() && week.endDate.valueOf() >= Date.now();
  }

  showAsCurrentDate(date: Date): boolean {
    return getMidnightUTC(new Date()) === getMidnightUTC(date);
  }

  showAsPastDate(date: Date): boolean {
    return getMidnightUTC(date) < getMidnightUTC(new Date());
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

  hasAllocationPreviewAfterChange(allocationPreview: number): boolean {
    return !!this.changed && allocationPreview >= 0;
  }

  getAllocationValue({ allocated, allocationPreview }: InventoryNumbers): number {
    return this.hasAllocationPreviewAfterChange(allocationPreview) ? allocationPreview : allocated;
  }

  showActualsValue(date: Date): boolean {
    return date.valueOf() < Date.now();
  }

  getZoneName(zoneId: string): string {
    const zone = this.zones && this.zones.find(z => z.id === zoneId);
    return zone && zone.label;
  }

  allocationPreviewExceedsAvailable({ availability, allocationPreview }: InventoryNumbers): boolean {
    return availability < allocationPreview;
  }
}
