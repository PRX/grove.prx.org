import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Flight, InventoryRollup, Inventory, InventoryZone, InventoryTargets, filterZones } from '../store/models';

export const validateMp3 = (control: AbstractControl): { [key: string]: any } | null => {
  if (control.value) {
    if (!control.value.match(/^http(s)?:\/\//)) {
      return { invalidUrl: { value: control.value } };
    } else if (!control.value.endsWith('.mp3')) {
      return { notMp3: { value: control.value } };
    }
  }
  return null;
};

@Component({
  selector: 'grove-flight',
  template: `
    <form [formGroup]="flightForm">
      <grove-flight-form
        [inventory]="inventory"
        [zoneOptions]="zoneOptions"
        [targetOptions]="targetOptions"
        [flight]="flight"
        [softDeleted]="softDeleted"
        (flightDeleteToggle)="flightDeleteToggle.emit($event)"
        (flightDuplicate)="flightDuplicate.emit($event)"
        (addZone)="onAddZone()"
        (removeZone)="onRemoveZone($event)"
      ></grove-flight-form>
      <grove-inventory
        [flight]="flight"
        [zones]="zoneOptions"
        [rollup]="rollup"
        [isPreview]="isPreview"
        [isLoading]="isLoading"
        [previewError]="previewError"
      >
      </grove-inventory>
    </form>
  `,
  styleUrls: ['./flight-form-control-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightFormControlContainerComponent implements OnInit, OnDestroy {
  @Input() inventory: Inventory[];
  @Input() zoneOptions: InventoryZone[];
  @Input() targetOptions: InventoryTargets;
  @Input() rollup: InventoryRollup;
  @Input() isPreview: boolean;
  @Input() isLoading: boolean;
  @Input() previewError: any;
  @Output() flightUpdate = new EventEmitter<{ flight: Flight; changed: boolean; valid: boolean }>(true);
  @Output() flightDuplicate = new EventEmitter<Flight>(true);
  @Output() flightDeleteToggle = new EventEmitter(true);
  formSubcription: Subscription;
  resetting = false;

  // tslint:disable-next-line
  private _flight: Flight;
  get flight(): Flight {
    return this._flight;
  }
  @Input()
  set flight(flight: Flight) {
    if (flight) {
      this.resetting = true;
      this._flight = flight;
      this.setFlightForm(this._flight);
      this.resetting = false;
    }
  }

  // tslint:disable-next-line
  private _softDeleted: boolean;
  get softDeleted() {
    return this._softDeleted;
  }
  @Input()
  set softDeleted(deleted: boolean) {
    this._softDeleted = deleted;
    Object.keys(this.flightForm.controls).forEach(key => {
      deleted ? this.flightForm.controls[key].disable({ emitEvent: false }) : this.flightForm.controls[key].enable({ emitEvent: false });
    });
  }

  flightForm = this.fb.group({
    id: [],
    name: ['', Validators.required],
    startAt: ['', Validators.required],
    endAtFudged: ['', Validators.required],
    contractStartAt: [''],
    contractEndAt: [''],
    contractEndAtFudged: [''],
    isCompanion: [false],
    zones: this.fb.array([]),
    targets: [''],
    set_inventory_uri: ['', Validators.required],
    totalGoal: ['', Validators.min(0)],
    contractGoal: ['', Validators.min(0)],
    dailyMinimum: ['', Validators.min(0)],
    deliveryMode: ['', Validators.required]
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formSubcription = this.flightForm.valueChanges.subscribe(flightFormModel => {
      this.onFormValueChanges(flightFormModel);
    });
  }

  ngOnDestroy() {
    if (this.formSubcription) {
      this.formSubcription.unsubscribe();
    }
  }

  // emits updates when reactive form fields change
  onFormValueChanges(flight: Flight) {
    if (!this.resetting) {
      this.flightUpdate.emit({
        flight,
        changed: this.flightForm.dirty,
        valid: this.flightForm.valid
      });
    }
  }

  get zonesControls(): FormArray {
    return this.flightForm.get('zones') as FormArray;
  }

  createZoneControl() {
    return this.fb.group({ id: ['', Validators.required], url: ['', validateMp3] });
  }

  onAddZone() {
    // create new form group/zone control with initial empty values
    const newZone = this.createZoneControl();
    // (re)set the new group/control value to the first option and remove that option from options list
    newZone.reset(filterZones(this.zoneOptions, this.flight.zones as InventoryZone[]).shift(), { emitEvent: false });
    this.zonesControls.markAsDirty();
    this.zonesControls.push(newZone);
  }

  onRemoveZone(index: number) {
    this.zonesControls.markAsDirty();
    this.zonesControls.removeAt(index);
  }

  // TODO: when zone options are set to empty, form should not be valid. maybe related to #199
  // updates the form from @Input() set flight
  setFlightForm(flight: Flight) {
    const zones = this.flightForm.get('zones') as FormArray;
    // get the correct number of zone fields
    while (this.zonesControls.length > (flight.zones.length || 1)) {
      this.zonesControls.removeAt(zones.length - 1);
      this.zonesControls.markAsPristine();
    }
    while (this.zonesControls.length < (flight.zones.length || 1)) {
      this.zonesControls.push(this.createZoneControl());
      this.zonesControls.markAsPristine();
    }

    // reset the form
    this.flightForm.reset(flight, { emitEvent: false });
  }
}
