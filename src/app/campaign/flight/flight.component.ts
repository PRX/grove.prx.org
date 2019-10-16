import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Flight, Inventory, InventoryZone } from '../../core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'grove-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightComponent implements OnInit {
  @Input() inventory: Inventory[];
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

  // tslint:disable-next-line
  private _zoneOptions: InventoryZone[];
  get zoneOptions(): InventoryZone[] {
    return this._zoneOptions;
  }
  @Input()
  set zoneOptions(opts: InventoryZone[]) {
    this._zoneOptions = opts || [];
    if (this.zones.value) {
      const filteredValues = this.zones.value.filter((id: string) => {
        return this.zoneOptions.find(z => z.id === id);
      });
      if (filteredValues.length !== this.zones.value.length) {
        this.zones.setValue(filteredValues);
        this.zones.markAsDirty();
        this.formStatusChanged(this.flightForm.value);
      }
    }
  }

  flightForm = this.fb.group({
    name: ['', Validators.required],
    startAt: ['', Validators.required],
    endAt: ['', Validators.required],
    totalGoal: ['', Validators.required],
    zones: ['', Validators.required],
    set_inventory_uri: ['', Validators.required]
  });

  get name() {
    return this.flightForm.get('name');
  }

  get zones() {
    return this.flightForm.get('zones');
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.flightForm.valueChanges.subscribe(cmp => {
      // if (this.flight) {
      this.formStatusChanged({ ...cmp, id: this.flight.id });
      // }
    });
  }

  formStatusChanged(flight?: Flight) {
    this.flightUpdate.emit({
      flight,
      changed: this.flightForm.dirty,
      valid: this.flightForm.valid
    });
  }

  updateFlightForm({ startAt, endAt, ...restOfFlight }: Flight) {
    this.flightForm.reset({ startAt: new Date(startAt), endAt: new Date(endAt), ...restOfFlight }, { emitEvent: false });
  }

  duplicateFlight() {
    this.flightDuplicate.emit(this.flight);
  }

  toggleDeleteFlight() {
    this.flightDeleteToggle.emit();
  }
}
