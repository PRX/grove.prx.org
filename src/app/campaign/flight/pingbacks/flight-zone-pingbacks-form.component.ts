import { Component, Input, forwardRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormControl, FormArray } from '@angular/forms';

@Component({
  selector: 'grove-flight-zone-pingbacks',
  template: `
    <fieldset>
      <div *ngFor="let pb of formArray.controls; let i = index" class="inline-fields">
        <grove-pingback
          [formControl]="pb"
          [campaignId]="campaignId"
          [flightId]="flightId"
          [podcastId]="podcastId"
          [creative]="creative"
        ></grove-pingback>
        <div *ngIf="formArray.controls.length > 1" class="remove-pingback mat-form-field-wrapper">
          <button mat-icon-button aria-label="Remove zone" (click)="onRemovePingback(i)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
      <button mat-button color="primary" (click)="onAddPingback()"><mat-icon>add</mat-icon> Add a pingback</button>
    </fieldset>
  `,
  styleUrls: ['./flight-zone-pingbacks-form.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FlightZonePingbacksFormComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: FlightZonePingbacksFormComponent, multi: true }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightZonePingbacksFormComponent implements ControlValueAccessor, OnDestroy {
  @Input() campaignId: string | number;
  @Input() flightId: number;
  @Input() creative: string;
  @Input() podcastId: string;
  formArray = new FormArray([].map(this.flightPingbackFormControl));
  valueChangesSub = this.formArray.valueChanges.subscribe(pingbacks => {
    if (this.formArray.valid && !this.emitGuard) {
      this.onChangeFn(pingbacks);
    }
  });
  emitGuard = false;
  onChangeFn = (value: any) => {};
  onTouchedFn = (value: any) => {};

  ngOnDestroy() {
    if (this.valueChangesSub) {
      this.valueChangesSub.unsubscribe();
    }
  }

  flightPingbackFormControl(pingback = ''): FormControl {
    return new FormControl(pingback);
  }

  writeValue(pingbacks: string[]) {
    // don't emit while manipulating FormArray with incoming update
    this.emitGuard = true;
    pingbacks = pingbacks && pingbacks.length ? pingbacks : [];
    // get the correct number of pingback fields and patchValue
    const expectedLength = pingbacks.length;
    while (this.formArray.controls.length > expectedLength) {
      this.formArray.removeAt(this.formArray.controls.length - 1);
      this.formArray.markAsPristine();
    }
    const addPingbacks = [...pingbacks];
    while (this.formArray.controls.length < expectedLength) {
      // this only adds controls, doesnt reset controls already in form
      this.formArray.push(this.flightPingbackFormControl(pingbacks && addPingbacks.pop()));
      this.formArray.markAsPristine();
    }
    this.formArray.patchValue(pingbacks, { emitEvent: false, onlySelf: true });
    this.emitGuard = false;
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: (value: any) => void) {
    this.onTouchedFn = fn;
  }

  validate(_: FormControl) {
    return this.formArray.valid ? null : { error: 'Invalid pingbacks' };
  }

  setDisabledState(isDisabled: boolean) {
    Object.keys(this.formArray.controls).forEach(key => {
      isDisabled ? this.formArray.controls[key].disable({ emitEvent: false }) : this.formArray.controls[key].enable({ emitEvent: false });
    });
  }

  onAddPingback() {
    this.formArray.push(new FormControl(''));
  }

  onRemovePingback(index: number) {
    this.formArray.removeAt(index);
  }
}
