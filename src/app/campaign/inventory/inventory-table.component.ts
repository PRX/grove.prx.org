import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Flight, FlightDay, InventoryRollup, InventoryWeeklyRollup } from '../store/models';
import { getMidnightUTC, getDateSlice } from '../store/selectors';

@Component({
  selector: 'grove-inventory-table',
  template: `
    <div *ngIf="isLoading" class="loading"><mat-spinner diameter="50"></mat-spinner></div>
    <div class="row head">
      <div class="expand"></div>
      <div class="date">Week</div>

      <ng-template [ngIf]="uncapped" [ngIfElse]="cappedHeader">
        <div class="expect">Expected</div>
        <div class="conflict">Conflicts</div>
      </ng-template>

      <ng-template #cappedHeader>
        <div class="avail">Available</div>
        <div class="goal">Allocated</div>
      </ng-template>

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

        <ng-template [ngIf]="uncapped" [ngIfElse]="cappedWeek">
          <div [class.preview]="isPreview">{{ week.numbers.available | largeNumber: '&mdash;' }}</div>
          <div [class.is-conflict]="numConflict(week) > 0">{{ numConflict(week) | largeNumber }}</div>
        </ng-template>

        <ng-template #cappedWeek>
          <div>{{ week.numbers.available | largeNumber: '&mdash;' }}</div>
          <div [class.preview]="isPreview">{{ week.numbers.allocated | largeNumber }}</div>
        </ng-template>

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

              <ng-template [ngIf]="uncapped" [ngIfElse]="cappedDay">
                <div class="expect" [class.preview]="isPreview">
                  <span>{{ day.numbers.available | largeNumber: '&mdash;' }}</span>
                </div>
                <div class="conflict" [class.is-conflict]="numConflict(day) > 0">
                  <div>{{ numConflict(day) | largeNumber }}</div>
                </div>
              </ng-template>

              <ng-template #cappedDay>
                <div class="avail">
                  <span>{{ day.numbers.available | largeNumber: '&mdash;' }}</span>
                </div>
                <div class="goal" [class.preview]="isPreview">
                  <span>{{ day.numbers.allocated | largeNumber }}</span>
                </div>
              </ng-template>

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

      <ng-template [ngIf]="uncapped" [ngIfElse]="cappedTotal">
        <div [class.preview]="isPreview">
          <span>{{ rollup.totals.available | largeNumber }}</span>
        </div>
        <div [class.is-conflict]="rollup.totals.inventory - rollup.totals.available > 0">
          <div>{{ rollup.totals.inventory - rollup.totals.available | largeNumber }}</div>
        </div>
      </ng-template>

      <ng-template #cappedTotal>
        <div>{{ rollup.totals.available | largeNumber }}</div>
        <div [class.preview]="isPreview">
          {{ rollup.totals.allocated | largeNumber }}
        </div>
      </ng-template>

      <div>
        {{ showActualsValue(flight.startAt.toDate()) ? (rollup.totals.actuals | largeNumber) : '&mdash;' }}
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
  @Input() isLoading: boolean;
  @Input() isPreview: boolean;
  zoneWeekExpanded = {};

  get uncapped(): boolean {
    return !!(this.flight && this.flight.deliveryMode === 'uncapped');
  }

  numConflict(week: InventoryWeeklyRollup): number {
    return week.numbers.inventory - week.numbers.available;
  }

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
