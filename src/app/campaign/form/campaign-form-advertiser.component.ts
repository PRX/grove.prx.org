import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'grove-campaign-form-advertiser',
  template: `
    <mat-form-field [formGroup]="formGroup">
      <mat-label>{{ label }}</mat-label>
      <input type="text" matInput #input [formControlName]="controlName" ngDefaultControl
        [matAutocomplete]="auto" (keydown.enter)="enterPressed($event)">
      <button type="button" mat-button matSuffix mat-stroked-button
        *ngIf="input.value && !findExistingOtion(input.value)"
        (click)="addNewOption(input.value)">
        Add {{ label }}
      </button>
    </mat-form-field>
    <mat-autocomplete autoActiveFirstOption required #auto="matAutocomplete" [displayWith]="optionName.bind(this)">
      <mat-option *ngFor="let option of filteredOptions | async" [value]="option.value">{{ option.name }}</mat-option>
    </mat-autocomplete>
  `,
  styleUrls: ['./campaign-form-advertiser.component.scss']
})
export class CampaignFormAdvertiserComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() controlName: string;
  @Input() label: string;
  @Input() options: {name: string, value: string}[];
  @Output() addOption = new EventEmitter<string>();
  filteredOptions: Observable<{name: string, value: string}[]>;

  ngOnInit() {
    this.filteredOptions = this.formGroup.get(this.controlName).valueChanges.pipe(
      startWith(''),
      map(value => this.options && this.options.filter(adv => adv.name.toLowerCase().indexOf(value.toLowerCase()) === 0))
    );
  }

  optionName(value?: string): string {
    if (value && this.options) {
      const option = this.options.find(o => o.value === value);
      return option && option.name;
    }
  }

  enterPressed(event: Event) {
    // getting an error, possibly from browser extensions?
    // Cannot read property 'type' of undefined at setFieldValue (onloadwff.js:71) at HTMLFormElement.formKeydownListener (onloadwff.js:71)
    // https://github.com/KillerCodeMonkey/ngx-quill/issues/351
    // This prevents the error, however it also prevents the form from submitting hitting enter on the autocomplete input field
    event.preventDefault();
    event.stopPropagation();
    // this.checkAndAddNewAdvertiser();
  }

  findExistingOtion(name: string) {
    return this.options.find(adv => adv.name === name || adv.value === name);
  }

  addNewOption(name: string) {
    if (name) {
      this.addOption.emit(name);
    }
  }
}
