import { Component, Input, forwardRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  FormArray,
  Validators,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
  FormControl,
  AbstractControl
} from '@angular/forms';
import { FlightZone, InventoryZone, filterZones } from '../store/models';
import { FlightFormErrorStateMatcher } from './flight-form.error-state-matcher';

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
      <div *ngFor="let zone of zones?.controls; let i = index" [formGroup]="zone" class="zone">
        <div class="inline-fields">
          <mat-form-field appearance="outline">
            <mat-label>Zone Name</mat-label>
            <mat-select formControlName="id" required>
              <mat-option *ngFor="let opt of zoneOptionsFiltered(i)" [value]="opt.id">{{ opt.label }}</mat-option>
            </mat-select>
          </mat-form-field>
          <!-- <mat-form-field appearance="outline">
            <mat-label>Creative Url</mat-label>
            <input
              matInput
              [errorStateMatcher]="matcher"
              formControlName="url"
              autocomplete="off"
              placeholder="Leave blank for a 0-second MP3"
            />
            <mat-error *ngIf="checkInvalidUrl(zone, 'invalidUrl')">Invalid URL</mat-error>
            <mat-error *ngIf="checkInvalidUrl(zone, 'notMp3')">Must end in mp3</mat-error>
          </mat-form-field> -->
          <!-- <div class="mat-form-field-wrapper">
            <button mat-button color="primary" class="toggle-pingbacks" (click)="togglePingbacks(zone)">
              {{ togglePingbacksText(zone) }}
            </button>
          </div> -->
          <div *ngIf="zones?.controls?.length > 1" class="remove-zone mat-form-field-wrapper">
            <button mat-icon-button aria-label="Remove zone" (click)="onRemoveZone(i)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
        <div *ngIf="zoneHasCreatives(zone)" class="flight-zone-creatives">
          <grove-creative-card
            *ngFor="let zoneCreative of flightZones[i]?.creativeFlightZones; let creativeIndex = index; trackBy: trackByIndex"
            [formGroup]="creativeFormGroup(zone, creativeIndex)"
            [creative]="zoneCreative?.creative"
            creativeLink="{{ zoneCreative?.creative?.id ? getZoneCreativeRoute(zone) + zoneCreative.creative.id : '' }}"
          ></grove-creative-card>
        </div>
        <!-- <grove-flight-zone-pingbacks
          *ngIf="zoneHasPingbacks(zone)"
          [campaignId]="campaignId"
          [flightId]="flightId"
          [creative]="zone.get('url').value"
          formControlName="pingbacks"
        ></grove-flight-zone-pingbacks> -->
        <div>
          <button [disabled]="!zone.get('id').value" mat-button color="primary" [matMenuTriggerFor]="addCreativeMenu">
            <mat-icon>add</mat-icon> Add a creative
          </button>
          <mat-menu #addCreativeMenu="matMenu" xPosition="after">
            <a mat-menu-item routerLink="{{ getZoneCreativeRoute(zone) + 'new' }}">Add New</a>
            <a mat-menu-item routerLink="{{ getZoneCreativeRoute(zone) + 'list' }}">Add Existing</a>
            <button mat-menu-item color="primary" (click)="onAddSilentCreative(zone)">Add Silent</button>
          </mat-menu>
        </div>
      </div>
    </fieldset>
    <div *ngIf="zones?.controls?.length < zoneOptions?.length">
      <button mat-button color="primary" (click)="onAddZone()"><mat-icon>add</mat-icon> {{ addZoneLabel }}</button>
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
  @Input() campaignId: number;
  @Input() flightId: number;
  matcher = new FlightFormErrorStateMatcher();
  zones = new FormArray([].map(this.flightZoneFormGroup));
  zonesSub = this.zones.valueChanges.subscribe(formZones => {
    if (!this.emitGuard) {
      this.onChangeFn(
        formZones.map(zone => ({
          ...zone,
          creativeFlightZones: zone.creativeFlightZones.map(creative => ({ ...creative, disabled: !creative.enabled }))
        }))
      );
    }
  });
  emitGuard = false;
  onChangeFn = (value: any) => {};
  onTouchedFn = (value: any) => {};

  ngOnDestroy() {
    if (this.zonesSub) {
      this.zonesSub.unsubscribe();
    }
  }

  flightZoneFormGroup(zone: FlightZone = { id: '' }): FormGroup {
    const { id, creativeFlightZones } = zone;
    return new FormGroup(
      {
        id: new FormControl(id || '', Validators.required),
        // url: new FormControl(url || '', control => validateMp3(control.value)),
        // pingbacks: new FormControl(pingbacks || [], control => validatePingbacks(control.value)),
        creativeFlightZones: new FormArray((creativeFlightZones || []).map(zoneCreative => this.buildCreativeFormGroup(zoneCreative)))
      },
      (zoneControl: FormControl) => (this.zoneHasCreatives(zoneControl) ? null : { error: 'Zone must have at least one creative' })
    );
  }

  buildCreativeFormGroup(zoneCreative): FormGroup {
    return new FormGroup({
      creativeId: new FormControl(zoneCreative.creative && zoneCreative.creative.id),
      creative: new FormControl(zoneCreative.creative),
      weight: new FormControl(zoneCreative.weight, [Validators.required, Validators.min(1), Validators.pattern(/[0-9]+/)]),
      enabled: new FormControl(!zoneCreative.disabled)
    });
  }

  writeValue(zones: FlightZone[]) {
    // don't emit while manipulating FormArray with incoming update
    this.emitGuard = true;
    // get the correct number of zone fields and patchValue
    zones = zones && zones.length ? zones : [{ id: '', creativeFlightZones: [] }];
    while (this.zones.controls.length > zones.length) {
      this.zones.removeAt(this.zones.controls.length - 1);
      this.zones.markAsPristine();
    }
    const addZones = [...zones];
    while (this.zones.controls.length < zones.length) {
      // this only adds controls, doesnt reset controls already in form
      this.zones.push(this.flightZoneFormGroup(zones && addZones.pop()));
      this.zones.markAsPristine();
    }

    // set creativeFlightZones controls
    this.zones.controls.forEach((zone, i) => {
      const zoneCreativesArray = zone.get('creativeFlightZones') as FormArray;
      if (zones[i].creativeFlightZones && zoneCreativesArray.controls.length !== zones[i].creativeFlightZones.length) {
        while (zoneCreativesArray.controls.length > zones[i].creativeFlightZones.length) {
          zoneCreativesArray.removeAt(zoneCreativesArray.controls.length - 1);
          zoneCreativesArray.markAsPristine();
        }
        const addCreatives = [...zones[i].creativeFlightZones];
        while (zoneCreativesArray.controls.length < zones[i].creativeFlightZones.length) {
          zoneCreativesArray.push(this.buildCreativeFormGroup(addCreatives.pop()));
        }
      }
    });

    // patch all of the values onto the FormArray
    this.zones.patchValue(zones, { emitEvent: false, onlySelf: true });
    this.emitGuard = false;
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
    // this add a control to the form that will result in a single FLIGHT_FORM_UPDATE action from the form's valueChanges stream
    this.zones.push(this.flightZoneFormGroup(filterZones(this.zoneOptions, this.flightZones as InventoryZone[]).shift()));
  }

  onRemoveZone(index: number) {
    // thisremoves a control from the form that will result in a single FLIGHT_FORM_UPDATE action from the form's valueChanges stream
    this.zones.removeAt(index);
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

  get addZoneLabel(): string {
    const type = this.isCompanion ? 'companion' : 'zone';
    return `Add a ${type}`;
  }

  zoneHasPingbacks(zone: FormControl): boolean {
    const pingbacks = zone.get('pingbacks');
    return pingbacks.value && pingbacks.value.length;
  }

  togglePingbacks(zone: FormControl) {
    this.zoneHasPingbacks(zone) ? zone.get('pingbacks').setValue([]) : zone.get('pingbacks').setValue(['']);
  }

  togglePingbacksText(zone: FormControl): string {
    return this.zoneHasPingbacks(zone) ? 'Remove pingbacks' : 'Add pingbacks';
  }

  getZoneCreativeRoute(zone: FormControl): string {
    return `/campaign/${this.campaignId}/flight/${this.flightId}/zone/${zone.get('id').value}/creative/`;
  }

  zoneHasCreatives(zone: FormControl): boolean {
    const creatives = zone.get('creativeFlightZones') as FormArray;
    return creatives && creatives.controls && !!creatives.controls.length;
  }

  creativeFormGroup(zone: FormControl, index) {
    return (zone.get('creativeFlightZones') as FormArray).controls[index];
  }

  trackByIndex(index, creative) {
    return index + '_' + creative.id;
  }

  onAddSilentCreative(zone: FormControl) {
    (zone.get('creativeFlightZones') as FormArray).push(this.buildCreativeFormGroup({}));
  }
}
