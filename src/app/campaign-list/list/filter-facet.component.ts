import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Facet } from '../campaign-list.service';

@Component({
  selector: 'grove-filter-facet',
  template: `
    <select (change)="onChange($event.target.value)">
      <option disabled [selected]="!selectedOption">Filter by {{facetName}}</option>
      <option *ngFor="let option of options"
        [value]="option.id"
        [selected]="selectedOption === option.id">{{option.label}}</option>
    </select>
    <button (click)="selectOption.emit('')" class="btn-link"><prx-icon size="1em" name="cancel"></prx-icon></button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterFacetComponent {
  @Input() facetName: string;
  @Input() options: Facet[];
  @Input() selectedOption: number | string;
  @Output() selectOption = new EventEmitter<number | string>();

  onChange(value: string) {
    let selected: number | string = value;
    if (this.options && this.options.length && typeof this.options[0].id === 'number') {
      selected = parseInt(value, 10);
    }
    this.selectOption.emit(selected);
  }
}
