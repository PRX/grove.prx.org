import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'grove-filter-date',
  template: `
    <mat-form-field appearance="outline">
      <input matInput [matDatepicker]="afterDate" [max]="before"
        [value]="after" (dateChange)="dateChange.emit({after: $event.value})">
      <mat-datepicker-toggle matSuffix [for]="afterDate"></mat-datepicker-toggle>
      <mat-datepicker #afterDate></mat-datepicker>
    </mat-form-field>

    <mat-form-field appearance="outline">
      <input matInput [matDatepicker]="beforeDate" [min]="after"
        [value]="before" (dateChange)="dateChange.emit({before: $event.value})">
      <mat-datepicker-toggle matSuffix [for]="beforeDate"></mat-datepicker-toggle>
      <mat-datepicker #beforeDate [startAt]="after"></mat-datepicker>
    </mat-form-field>
  `,
  styleUrls: ['./filter-date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterDateComponent {
  @Input() after: Date;
  @Input() before: Date;
  @Output() dateChange = new EventEmitter<{before?: Date, after?: Date}>();
}
