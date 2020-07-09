import { Component, Input, forwardRef, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  FormGroupDirective,
  FormArray,
  Validators,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
  FormControl,
  AbstractControl
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { FlightZone, InventoryZone, filterZones } from '../store/models';

export class ZonesErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective): boolean {
    // when url is invalid, the FormArray control is showing as dirty but not as touched
    // so this ErrorStateMatcher overrides material to show errors when these controls are invalid and dirty
    return control && control.invalid && (control.dirty || control.touched);
  }
}

export const validateMp3 = (value: string): { [key: string]: any } | null => {
  if (value) {
    if (!value.match(/^http(s)?:\/\//)) {
      return { invalidUrl: { value } };
    } else if (!value.endsWith('.mp3')) {
      return { notMp3: { value } };
    }
  }
  return null;
};

@Component({
  selector: 'grove-flight-zones',
  template: `
    <fieldset>
      <div *ngFor="let zone of zones?.controls; let i = index" [formGroup]="zone" class="inline-fields">
        <mat-form-field appearance="outline">
          <mat-label>Zone Name</mat-label>
          <mat-select formControlName="id" required>
            <mat-option *ngFor="let opt of zoneOptionsFiltered(i)" [value]="opt.id">{{ opt.label }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Creative Url</mat-label>
          <input matInput formControlName="url" autocomplete="off" placeholder="Leave blank for a 0-second MP3" />
          <mat-error *ngIf="checkInvalidUrl(zone, 'invalidUrl')">Invalid URL</mat-error>
          <mat-error *ngIf="checkInvalidUrl(zone, 'notMp3')">Must end in mp3</mat-error>
        </mat-form-field>
        <div *ngIf="zones?.controls?.length > 1" class="remove-zone mat-form-field-wrapper">
          <button mat-icon-button aria-label="Remove zone" (click)="onRemoveZone(i)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
    </fieldset>
    <div *ngIf="zones?.controls?.length < zoneOptions?.length">
      <a mat-button routerLink="." (click)="onAddZone()"> <mat-icon>add</mat-icon> {{ addCreativeLabel }} </a>
    </div>
  `,
  styleUrls: ['./flight-zones-form.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FlightZonesFormComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: FlightZonesFormComponent, multi: true }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightZonesFormComponent implements ControlValueAccessor, OnDestroy {
  @Input() flightZones: FlightZone[];
  @Input() isCompanion: boolean;
  @Input() zoneOptions: InventoryZone[];
  @Output() addZone = new EventEmitter<{ zone: FlightZone }>();
  @Output() removeZone = new EventEmitter<{ index: number }>();
  matcher = new ZonesErrorStateMatcher();
  zones = new FormArray([].map(this.flightZoneFormGroup));
  zonesSub = this.zones.valueChanges.subscribe(formZones => {
    this.onChangeFn(formZones);
  });
  onChangeFn = (value: any) => {};
  onTouchedFn = (value: any) => {};

  ngOnDestroy() {
    if (this.zonesSub) {
      this.zonesSub.unsubscribe();
    }
  }

  flightZoneFormGroup(zone: FlightZone = { id: '' }): FormGroup {
    const { id, url } = zone;
    return new FormGroup({
      id: new FormControl(id || '', Validators.required),
      url: new FormControl(url || '', control => validateMp3(control.value))
    });
  }

  writeValue(zones: FlightZone[]) {
    // get the correct number of zone fields and patchValue
    const expectedLength = zones.length || 1;
    while (this.zones.controls.length > expectedLength) {
      this.zones.removeAt(this.zones.controls.length - 1);
      this.zones.markAsPristine();
    }
    const addZones = [...zones];
    while (this.zones.controls.length < expectedLength) {
      // this only adds controls, doesnt reset controls already in form
      this.zones.push(this.flightZoneFormGroup(zones && addZones.pop()));
      this.zones.markAsPristine();
    }
    // patch all of the values onto the FormArray
    this.zones.patchValue(zones || [], { emitEvent: false });
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: (value: any) => void) {
    this.onTouchedFn = fn;
  }

  validate(_: FormControl) {
    return this.zones.valid ? null : { error: 'Invalid zones' };
  }

  checkInvalidUrl(zone: AbstractControl, type: string): boolean {
    return zone.get('url').hasError(type);
  }

  onAddZone() {
    // this will send an Add Zone action dispatch up thru the state to be added to the flight,
    //  and the zone control will be added to the form in writeValue
    // add the zone that's at the top of the options list
    this.addZone.emit({ zone: filterZones(this.zoneOptions, this.flightZones as InventoryZone[]).shift() });
  }

  onRemoveZone(index: number) {
    // sends an action dispatch up thru the state to be removed from the flight,
    //  and the zone control will be removed from the form in writeValue
    this.removeZone.emit({ index });
  }

  // filters to the zone options remaining (each zone can only be selected once)
  zoneOptionsFiltered(index: number): InventoryZone[] {
    const flightZones = this.flightZones || [];
    return filterZones(this.zoneOptions, flightZones as InventoryZone[], index);
  }

  // must implement disabled for the softDelete button
  setDisabledState(isDisabled: boolean) {
    Object.keys(this.zones.controls).forEach(key => {
      isDisabled ? this.zones.controls[key].disable({ emitEvent: false }) : this.zones.controls[key].enable({ emitEvent: false });
    });
  }

  get addCreativeLabel(): string {
    const type = this.isCompanion ? 'companion' : 'creative';
    return `Add a ${type}`;
  }
}
