import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Inventory, InventoryZone } from '../../core';
import { Flight, isNameChanged, isInventoryChanged, isStartAtChanged, isEndAtChanged, isZonesChanged } from '../store/models';

@Component({
  selector: 'grove-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightComponent implements OnInit {
  @Input() inventory: Inventory[];
  @Input() zoneOptions: InventoryZone[];
  @Output() flightUpdate = new EventEmitter<{ flight: Flight; changed: boolean; valid: boolean }>(true);
  @Output() flightDuplicate = new EventEmitter<Flight>(true);
  @Output() flightDeleteToggle = new EventEmitter(true);

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

  // tslint:disable-next-line
  private _flight: Flight;
  get flight(): Flight {
    return this._flight;
  }
  @Input()
  set flight(flight: Flight) {
    if (flight) {
      this._flight = flight;
      this.updateFlightForm(this._flight);
    }
  }

  flightForm = this.fb.group({
    id: [],
    name: ['', Validators.required],
    startAt: ['', Validators.required],
    endAt: ['', Validators.required],
    zones: this.fb.array([]),
    set_inventory_uri: ['', Validators.required],
    totalGoal: [0, Validators.required]
  });

  get name() {
    return this.flightForm.get('name');
  }

  get zones() {
    return this.flightForm.get('zones') as FormArray;
  }

  get zoneControl() {
    return this.fb.group({ id: ['', Validators.required], url: ['', this.validateMp3] });
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.flightForm.valueChanges.subscribe(flightFormModel => {
      this.formStatusChanged(flightFormModel);
    });
  }

  // zone options to the control at an index (include currently selected zone
  // name, but remove zones selected by other controls)
  zoneOptionsFiltered(zoneIndex?: number) {
    const myZones = (this.flight && this.flight.zones) || [];

    // if zoneOptions hasn't loaded yet, use flight.zones as options
    const options = this.zoneOptions || (myZones as InventoryZone[]);
    return options.filter(zone => {
      if (myZones[zoneIndex] && myZones[zoneIndex].id === zone.id) {
        return true;
      } else {
        return !myZones.find(z => z.id === zone.id);
      }
    });
  }

  isFlightFormChanged(flight: Flight) {
    return (
      isNameChanged(flight, this.flight) ||
      isStartAtChanged(flight, this.flight) ||
      isEndAtChanged(flight, this.flight) ||
      isInventoryChanged(flight, this.flight) ||
      isZonesChanged(flight, this.flight)
    );
  }

  // emits updates when reactive form fields change
  formStatusChanged(flight: Flight) {
    if (this.isFlightFormChanged(flight)) {
      this.flightUpdate.emit({
        flight,
        changed: this.flightForm.dirty,
        valid: this.flightForm.valid
      });
    }
  }

  // updates the form from @Input() set flight
  updateFlightForm(flight: Flight) {
    // get the correct number of zone fields
    while (this.zones.length > (flight.zones.length || 1)) {
      this.zones.removeAt(this.zones.length - 1);
      this.zones.markAsPristine();
    }
    while (this.zones.length < (flight.zones.length || 1)) {
      this.zones.push(this.zoneControl);
      this.zones.markAsPristine();
    }

    // reset the form
    this.flightForm.reset(flight, { emitEvent: false });
  }

  onAddZone() {
    const newZone = this.zoneControl;
    newZone.reset(this.zoneOptionsFiltered().shift());
    this.zones.markAsDirty();
    this.zones.push(newZone);
  }

  onRemoveZone(index: number) {
    this.zones.markAsDirty();
    this.zones.removeAt(index);
  }

  onFlightDuplicate() {
    this.flightDuplicate.emit(this.flight);
  }

  onFlightDeleteToggle() {
    this.flightDeleteToggle.emit();
  }

  checkInvalidUrl(zone: AbstractControl, type: string): boolean {
    return zone.get('url').hasError(type);
  }

  validateMp3(control: AbstractControl): { [key: string]: any } | null {
    if (control.value) {
      if (!control.value.match(/^http(s)?:\/\//)) {
        return { invalidUrl: { value: control.value } };
      } else if (!control.value.endsWith('.mp3')) {
        return { notMp3: { value: control.value } };
      }
    }
    return null;
  }
}
