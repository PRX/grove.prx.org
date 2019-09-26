import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'grove-autocomplete',
  template: `
    <mat-form-field [formGroup]="formGroup" appearance="outline">
      <mat-label>{{ label }}</mat-label>
      <input type="text" matInput #input [formControlName]="controlName"
        [matAutocomplete]="auto" (keydown.enter)="enterPressed($event)">
      <button type="button" mat-button matSuffix mat-stroked-button
        *ngIf="input.value && !findExistingOtion(input.value)"
        (click)="addNewOption(input.value)">
        Add {{ label }}
      </button>
    </mat-form-field>
    <mat-autocomplete autoActiveFirstOption required
      #auto="matAutocomplete" [displayWith]="optionName.bind(this)">
      <mat-option *ngFor="let option of filteredOptions$ | async" [value]="option.value">{{ option.name }}</mat-option>
    </mat-autocomplete>
  `,
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() label: string;
  @Input() options: {name: string, value: string}[];
  @Output() addOption = new EventEmitter<string>();
  filteredOptions$: Observable<{name: string, value: string}[]>;

  ngOnInit() {
    this.filteredOptions$ = this.formGroup.get(this.controlName).valueChanges.pipe(
      startWith(''),
      map(value => {
        if (this.options) {
          // if no value or valueChange matches one of the existing options, list is unfiltered
          if (!value || this.options.find(opt => opt.value === value)) {
            return this.options;
          } else {
            return this.options.filter(opt => {
              // partial match: option name contains text search "value"
              return opt.name.toLowerCase().indexOf(value.toLowerCase()) === 0;
            });
          }
        }
      }));
  }

  optionName(value?: string): string {
    if (value && this.options) {
      const option = this.options.find(opt => opt.value === value);
      return option && option.name;
    }
  }

  enterPressed(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const value = this.formGroup.get(this.controlName).value;
    if (value && !this.findExistingOtion(value)) {
      this.addNewOption(value);
    }
  }

  findExistingOtion(name: string) {
    return this.options.find(opt => opt.name === name || opt.value === name);
  }

  addNewOption(name: string) {
    if (name) {
      this.addOption.emit(name);
    }
  }
}
