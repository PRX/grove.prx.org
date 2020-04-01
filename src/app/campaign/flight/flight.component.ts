import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Inventory, InventoryZone } from '../../core';
import { Flight, FlightZone } from '../store/models';
import { FormBuilder, Validators, FormArray } from '@angular/forms';

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
  @Output() flightAddZone = new EventEmitter<FlightZone>(true);
  @Output() flightRemoveZone = new EventEmitter<FlightZone>(true);
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
    name: ['', Validators.required],
    startAt: ['', Validators.required],
    endAt: ['', Validators.required],
    zones: this.fb.array([this.zoneControl]),
    set_inventory_uri: ['', Validators.required]
  });

  get zones() {
    return this.flightForm.get('zones') as FormArray;
  }

  get zoneControl() {
    return this.fb.group({id: ['', Validators.required], url: ['']});
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.flightForm.valueChanges.subscribe(cmp => {
      // preserving id on the flight because doesn't exist in form fields
      this.formStatusChanged({ ...cmp, id: this.flight.id });
    });
  }

  zoneOptionsFiltered(zoneIndex?: number) {
    const myZones = (this.flight && this.flight.zones) || [];
    return (this.zoneOptions || myZones).filter(zone => {
      if (myZones[zoneIndex] && myZones[zoneIndex].id === zone.id) {
        return true;
      } else {
        return !myZones.find(z => z.id === zone.id);
      }
    });
  }

  // emits updates when reactive form fields change
  formStatusChanged(flight?: Flight) {
    this.flightUpdate.emit({
      flight: { ...flight, totalGoal: this.flight.totalGoal },
      changed: this.flightForm.dirty,
      valid: this.flightForm.valid
    });
  }

  onDateRangeChange({ startAt, endAt }: { startAt?: Date; endAt?: Date }) {
    this.flightUpdate.emit({
      flight: {
        ...this.flight,
        ...(startAt && { startAt }),
        ...(endAt && { endAt }),
        totalGoal: this.flight.totalGoal
      },
      changed: true,
      valid: this.flightForm.valid
    });
  }

  // updates the form from @Input() set flight
  updateFlightForm(flight: Flight) {
    while (this.zones.length > (flight.zones.length || 1)) {
      // TODO: what's with the flickering values???
      this.zones.removeAt(this.zones.length - 1);
    }

    // NOTE: pushing a new control onto the form array apparently emits
    // the form-changed event. so give it the correct value BEFORE pushing.
    while (this.zones.length < flight.zones.length) {
      const newZone = this.zoneControl;
      newZone.reset(flight.zones[this.zones.length], { emitEvent: false });
      this.zones.push(newZone);
    }

    // reset the form only AFTER all FormArrays match
    this.flightForm.reset(flight, { emitEvent: false });
  }

  onAddZone() {
    this.flightAddZone.emit(this.zoneOptionsFiltered().shift());
  }

  onRemoveZone(index: number) {
    this.flightRemoveZone.emit(this.flight.zones[index]);
  }

  onFlightDuplicate() {
    this.flightDuplicate.emit(this.flight);
  }

  onFlightDeleteToggle() {
    this.flightDeleteToggle.emit();
  }
}
