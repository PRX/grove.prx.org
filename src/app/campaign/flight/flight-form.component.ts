import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, ControlContainer } from '@angular/forms';
import { Flight, FlightZone, Inventory, InventoryZone, InventoryTargets, filterZones } from '../store/models';

@Component({
  selector: 'grove-flight-form',
  templateUrl: './flight-form.component.html',
  styleUrls: ['./flight-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightFormComponent implements OnInit {
  @Input() flight: Flight;
  @Input() inventory: Inventory[];
  @Input() zoneOptions: InventoryZone[];
  @Input() targetOptions: InventoryTargets;
  @Input() softDeleted: boolean;
  @Output() flightDuplicate = new EventEmitter<Flight>(true);
  @Output() flightDeleteToggle = new EventEmitter(true);
  @Output() addZone = new EventEmitter<{ flightId: number; zone: FlightZone }>();
  @Output() removeZone = new EventEmitter<{ flightId: number; index: number }>();
  flightForm: FormGroup;

  ngOnInit() {
    this.flightForm = this.formContainer.control as FormGroup;
  }

  constructor(private formContainer: ControlContainer) {}

  onFlightDuplicate() {
    this.flightDuplicate.emit(this.flight);
  }

  onFlightDeleteToggle() {
    this.flightDeleteToggle.emit();
  }

  get canBeDeleted(): boolean {
    return this.flight && !this.flight.actualCount;
  }

  onAddZone({ zone }: { zone: FlightZone }) {
    this.addZone.emit({ flightId: this.flight.id, zone });
  }

  onRemoveZone({ index }: { index: number }) {
    this.removeZone.emit({ flightId: this.flight.id, index });
  }
}
