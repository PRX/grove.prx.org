import { Component, Input, forwardRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormControl, FormArray } from '@angular/forms';

@Component({
  selector: 'grove-creative-pingbacks',
  template: `
    <fieldset>
      <div *ngIf="formArray.controls.length" class="heading">
        <h3>Pingbacks</h3>
        <a href="https://github.com/PRX/analytics-ingest-lambda#uri-templates" target="_blank" rel="noopener noreferrer">
          URI syntax help
        </a>
      </div>
      <grove-pingback
        *ngFor="let pb of formArray.controls; let i = index"
        [formControl]="pb"
        [campaignId]="campaignId"
        [flightId]="flightId"
        [creative]="creative"
        (removePingback)="onRemovePingback(i)"
      ></grove-pingback>
      <button type="button" mat-button color="primary" (click)="onAddPingback()"><mat-icon>add</mat-icon> Add a pingback</button>
    </fieldset>
  `,
  styleUrls: ['./creative-pingbacks-form.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CreativePingbacksFormComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: CreativePingbacksFormComponent, multi: true }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativePingbacksFormComponent implements ControlValueAccessor, OnDestroy {
  @Input() campaignId: string | number;
  @Input() flightId: number;
  @Input() creative: string;
  formArray = new FormArray([].map(this.pingbackFormControl));
  valueChangesSub = this.formArray.valueChanges.subscribe(pingbacks => {
    if (!this.emitGuard) {
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

  pingbackFormControl(pingback = ''): FormControl {
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
      this.formArray.push(this.pingbackFormControl(pingbacks && addPingbacks.pop()));
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
