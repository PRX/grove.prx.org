import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, ControlContainer } from '@angular/forms';
import { Inventory, InventoryZone, filterZones } from '../../core';
import { Flight } from '../store/models';

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
  @Input() softDeleted: boolean;
  @Output() flightDuplicate = new EventEmitter<Flight>(true);
  @Output() flightDeleteToggle = new EventEmitter(true);
  @Output() addZone = new EventEmitter();
  @Output() removeZone = new EventEmitter<number>();
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

  checkInvalidUrl(zone: AbstractControl, type: string): boolean {
    return zone.get('url').hasError(type);
  }

  zoneOptionsFiltered(index: number): InventoryZone[] {
    return filterZones(this.zoneOptions, this.flight.zones as InventoryZone[], index);
  }

  get zonesControls(): FormArray {
    return this.flightForm.get('zones') as FormArray;
  }
}
