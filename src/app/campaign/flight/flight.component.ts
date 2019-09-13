import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { Flight } from 'src/app/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'grove-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss']
})
export class FlightComponent implements OnInit, OnChanges {
  @Input() flight: Flight;
  @Output() flightUpdate = new EventEmitter<{ flight: Flight; changed: boolean; valid: boolean }>(true);

  flightForm = this.fb.group({
    name: ['', Validators.required]
  });

  get name() {
    return this.flightForm.get('name');
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
  }

  formStatusChanged(flight?: Flight) {
    this.flightUpdate.emit({
      flight,
      changed: this.flightForm.dirty,
      valid: this.flightForm.valid
    });
  }

  updateFlightForm({ name }: Flight) {
    this.flightForm.reset({ name });
    this.formStatusChanged();
  }
}
