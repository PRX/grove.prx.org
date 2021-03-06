import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Facet } from '../dashboard.service';

@Component({
  selector: 'grove-filter-facet',
  template: `
    <mat-form-field appearance="outline">
      <mat-select
        formControlName="status"
        placeholder="Filter by {{facetName}}"
        [multiple]="multiple"
        [(value)]="selectedOptions">
        <mat-option *ngIf="!multiple">None</mat-option>
        <mat-option *ngFor="let option of options" [value]="option.id">{{ option.label }}</mat-option>
      </mat-select>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterFacetComponent {
  @Input() facetName: string;
  @Input() multiple: boolean;
  @Input() options: Facet[];
  @Input()
  set selectedOptions(values: number | string | number[] | string[]) {
    this._selectedOptions = values;
    this.selectedOptionsChange.emit(values);
  }
  get selectedOptions() {
    return this._selectedOptions;
  }
  @Output() selectedOptionsChange = new EventEmitter<number | string | number[] | string[]>();
  // tslint:disable-next-line: variable-name
  _selectedOptions: number | string | number[] | string[];
}
