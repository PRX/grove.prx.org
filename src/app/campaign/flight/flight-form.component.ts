import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, AbstractControl, ControlContainer } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import {
  Flight,
  FlightZone,
  Inventory,
  InventoryZone,
  InventoryTargets,
  InventoryTargetType,
  FlightTarget,
  InventoryTargetsMap
} from '../store/models';

export class FlightFormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl): boolean {
    return control && control.invalid && (control.dirty || control.touched);
  }
}
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
  @Input() targetTypes: InventoryTargetType[];
  @Input() targetOptionsMap: InventoryTargetsMap;
  @Input() softDeleted: boolean;
  @Output() flightDuplicate = new EventEmitter<Flight>(true);
  @Output() flightDeleteToggle = new EventEmitter(true);

  flightForm: FormGroup;
  matcher = new FlightFormErrorStateMatcher();

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

  checkError(fieldName: string, type = 'error') {
    return this.flightForm.get(fieldName).getError(type);
  }
}
