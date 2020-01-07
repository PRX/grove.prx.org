import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Flight, Inventory, InventoryZone } from '../../core';
import { FormBuilder, Validators } from '@angular/forms';

interface FlightFormShape {
  name: string;
  dateRange: { startDate: Date, endDate: Date};
  zones: string[];
  set_inventory_uri: string;
}

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
        this.formStatusChanged(this.formToFlight(this.flightForm.value));
      }
    }
  }

  flightForm = this.fb.group(this.formShape);

  // Reactive forms are, unfortunately, not strongly typed: https://github.com/angular/angular/issues/13721
  // this is a bit of a kludge to make sure that our form conforms to the shape we expect it to
  get formShape(): {[key in keyof FlightFormShape]: [string | {startDate: any, endDate: any}, Validators]} {
    return {
      name: ['', Validators.required],
      dateRange: [{startDate: null, endDate: null}, Validators.required],
      // startAt: ['', Validators.required],
      // endAt: ['', Validators.required],
      zones: ['', Validators.required],
      set_inventory_uri: ['', Validators.required]
    }
  }

  formToFlight(formData: FlightFormShape): Flight {
    const { dateRange: {startDate, endDate}, ...restOfFlight } = formData;
    return {
      startAt: startDate ? startDate.toISOString() : null,
      endAt: endDate ? endDate.toISOString() : null,
      totalGoal: this.flight.totalGoal,
      ...restOfFlight
    };
  }

  get name() {
    return this.flightForm.get('name');
  }

  get zones() {
    return this.flightForm.get('zones');
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.flightForm.valueChanges.subscribe(cmp => {
      this.formStatusChanged({ ...this.formToFlight(cmp), id: this.flight.id });
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
    this.flightForm.reset({
      dateRange: {
        startDate: startAt ? new Date(startAt) : startAt,
        endDate: endAt ? new Date(endAt) : endAt },
        ...restOfFlight
      }, { emitEvent: false });
  }

  onFlightDuplicate() {
    this.flightDuplicate.emit(this.flight);
  }

  onFlightDeleteToggle() {
    this.flightDeleteToggle.emit();
  }
}
