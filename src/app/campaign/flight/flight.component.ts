import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Flight, Inventory, InventoryZone } from '../../core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'grove-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightComponent implements OnInit, OnChanges {
  @Input() flight: Flight;
  @Input() inventory: Inventory[];
  @Input() zoneOptions: InventoryZone[];
  @Output() flightUpdate = new EventEmitter<{ flight: Flight; changed: boolean; valid: boolean }>(true);

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
      this.formStatusChanged(cmp);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.flight && changes.flight.currentValue) {
      this.updateFlightForm(this.flight);
    }
    if (changes.zoneOptions && changes.zoneOptions.currentValue) {
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
}
