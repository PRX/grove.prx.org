import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Flight, FlightDay, InventoryRollup, InventoryWeeklyRollup } from '../store/models';
import { getMidnightUTC, getDateSlice } from '../store/selectors';

@Component({
  selector: 'grove-inventory-table',
  template: `
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
        [class.row-highlight]="!isZoneWeekExpanded(week) && anyDaysBorked(week.days)"
        [class.expanded]="isZoneWeekExpanded(week)"
        [class.current-date]="showAsCurrentWeek(week)"
        [class.past-date]="showAsPastDate(week.endDate)"
      >
        <div class="expand">
          <button class="btn-link" (click)="toggleZoneWeekExpanded(week)">
            <prx-icon class="icon" name="arrows-alt-v" size="1rem" color="primary"></prx-icon>
          </button>
        </div>
        <div class="date">
          {{ week.startDate | date: 'M/dd':'+0000' }}
        </div>
        <div>{{ week.numbers.available | largeNumber }}</div>
        <div [class.preview]="isPreview">
          {{ week.numbers.allocated | largeNumber }}
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
              [class.row-highlight]="day.borked"
              [class.current-date]="showAsCurrentDate(day.date)"
              [class.past-date]="showAsPastDate(day.date)"
            >
              <div class="expand"></div>
              <div class="date">
                <span>{{ day.date | date: 'M/dd':'+0000' }}</span>
              </div>
              <div class="avail">
                <span>{{ day.numbers.available | largeNumber }}</span>
              </div>
              <div class="goal" [class.preview]="isPreview">
                <span>{{ day.numbers.allocated | largeNumber }}</span>
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
    <div class="row totals">
      <div class="expand"></div>
      <div class="date">TOTALS</div>
      <div>{{ rollup.totals.available | largeNumber }}</div>
      <div [class.preview]="isPreview">
        {{ rollup.totals.allocated | largeNumber }}
      </div>
      <div>
        {{ showActualsValue(flight.startAt.toDate()) ? rollup.totals.actuals : '&mdash;' }}
      </div>
      <div class="edit"></div>
    </div>
  `,
  styleUrls: ['inventory-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventoryTableComponent {
  @Input() flight: Flight;
  @Input() rollup: InventoryRollup;
  @Input() isPreview: boolean;
  zoneWeekExpanded = {};

  isZoneWeekExpanded(week: InventoryWeeklyRollup): boolean {
    return this.zoneWeekExpanded[getDateSlice(week.startDate)];
  }

  toggleZoneWeekExpanded(week: InventoryWeeklyRollup) {
    const date = getDateSlice(week.startDate);
    this.zoneWeekExpanded[date] = !this.zoneWeekExpanded[date];
  }

  showAsCurrentWeek(week: InventoryWeeklyRollup): boolean {
    return !this.isZoneWeekExpanded(week) && week.startDate.valueOf() <= Date.now() && week.endDate.valueOf() >= Date.now();
  }

  showAsCurrentDate(date: Date): boolean {
    return getMidnightUTC(new Date()) === getMidnightUTC(date);
  }

  showAsPastDate(date: Date): boolean {
    return getMidnightUTC(date) < getMidnightUTC(new Date());
  }

  showActualsValue(date: Date): boolean {
    return date.valueOf() < Date.now();
  }

  anyDaysBorked(days: FlightDay[]): boolean {
    return days.some(day => day.borked);
  }
}
