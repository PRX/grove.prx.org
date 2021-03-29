import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, AbstractControl, ControlContainer } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Flight, Inventory, InventoryZone, InventoryTargetType, InventoryTargetsMap, FlightStatusOption } from '../store/models';

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
  @Input() statusOptions: FlightStatusOption[];

  flightForm: FormGroup;

  ngOnInit() {
    this.flightForm = this.formContainer.control as FormGroup;
  }

  constructor(private formContainer: ControlContainer) {}

  checkError(fieldName: string, type = 'error') {
    return this.flightForm.get(fieldName).getError(type);
  }
}
