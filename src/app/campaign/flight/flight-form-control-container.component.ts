import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  Flight,
  InventoryRollup,
  Inventory,
  InventoryZone,
  InventoryTargets,
  InventoryTargetType,
  InventoryTargetsMap,
  FlightStatusOption
} from '../store/models';
import moment from 'moment';

@Component({
  selector: 'grove-flight',
  template: `
    <form [formGroup]="flightForm">
      <grove-flight-form
        [inventory]="inventory"
        [zoneOptions]="zoneOptions"
        [targetTypes]="targetTypes"
        [targetOptionsMap]="targetOptionsMap"
        [statusOptions]="statusOptions"
        [flight]="flight"
        [softDeleted]="softDeleted"
        (flightDeleteToggle)="flightDeleteToggle.emit($event)"
        (flightDuplicate)="flightDuplicate.emit($event)"
      ></grove-flight-form>
      <grove-inventory
        [flight]="flight"
        [zones]="zoneOptions"
        [rollup]="rollup"
        [isPreview]="isPreview"
        [isLoading]="isLoading"
        [previewError]="previewError"
        [flightOverlap]="flightOverlap"
        [flightOverlapIsLoading]="flightOverlapIsLoading"
        [flightOverlapError]="flightOverlapError"
      >
      </grove-inventory>
    </form>
  `,
  styleUrls: ['./flight-form-control-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightFormControlContainerComponent implements OnInit, OnDestroy {
  @Input() inventory: Inventory[];
  @Input() zoneOptions: InventoryZone[];
  @Input() targetOptions: InventoryTargets;
  @Input() targetTypes: InventoryTargetType[];
  @Input() targetOptionsMap: InventoryTargetsMap;
  @Input() statusOptions: FlightStatusOption[];
  @Input() rollup: InventoryRollup;
  @Input() isPreview: boolean;
  @Input() isLoading: boolean;
  @Input() previewError: any;
  @Input() flightActualsDateBoundaries: { startAt: Date; endAt: Date };
  @Input() flightOverlap: Flight[];
  @Input() flightOverlapIsLoading: boolean;
  @Input() flightOverlapError: any;
  @Output() flightUpdate = new EventEmitter<{ flight: Flight; changed: boolean; valid: boolean }>(true);
  @Output() flightDuplicate = new EventEmitter<Flight>(true);
  @Output() flightDeleteToggle = new EventEmitter(true);
  formSubcription: Subscription;
  resetting = false;

  // tslint:disable-next-line
  private _flight: Flight;
  get flight(): Flight {
    return this._flight;
  }
  @Input()
  set flight(flight: Flight) {
    if (flight) {
      this.resetting = true;
      this._flight = flight;
      this.setFlightForm(this._flight);
      this.resetting = false;
    }
  }

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

  flightForm = this.fb.group({
    id: [],
    name: ['', Validators.required],
    status: ['', Validators.required],
    startAt: ['', { validators: [Validators.required, this.validateStartAt.bind(this)], updateOn: 'blur' }],
    endAtFudged: ['', { validators: [Validators.required, this.validateEndAt.bind(this)], updateOn: 'blur' }],
    contractStartAt: [''],
    contractEndAtFudged: [''],
    isCompanion: [false],
    zones: [''],
    targets: [''],
    set_inventory_uri: ['', Validators.required],
    allocationPriority: ['10', Validators.min(1)],
    totalGoal: ['', Validators.min(0)],
    contractGoal: ['', Validators.min(0)],
    dailyMinimum: ['', Validators.min(0)],
    deliveryMode: ['', Validators.required],
    velocity: ['']
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formSubcription = this.flightForm.valueChanges.subscribe(flightFormModel => {
      this.onFormValueChanges(flightFormModel);
    });
  }

  ngOnDestroy() {
    if (this.formSubcription) {
      this.formSubcription.unsubscribe();
    }
  }

  validateStartAt(startAtCtrl: AbstractControl): { [key: string]: any } | null {
    return this.validateStartAtDate(startAtCtrl.value, this.flightForm && this.flightForm.get('endAtFudged').value);
  }

  validateEndAt(endAtCtrl: AbstractControl): { [key: string]: any } | null {
    return this.validateEndAtDate(this.flightForm && this.flightForm.get('startAt').value, endAtCtrl.value);
  }

  validateStartAtDate(startAt: moment.Moment, endAt: moment.Moment): { [key: string]: any } | null {
    if (startAt && endAt && startAt.valueOf() > endAt.valueOf()) {
      return { error: `Cannot set start date after ${moment.utc(endAt).format('M/D/YYYY')} end date` };
    } else if (
      startAt &&
      this.flightActualsDateBoundaries &&
      this.flightActualsDateBoundaries.startAt &&
      this.flightActualsDateBoundaries.startAt.valueOf() < startAt.valueOf()
    ) {
      return { error: `Cannot set start date after ${moment.utc(this.flightActualsDateBoundaries.startAt).format('M/D/YYYY')} actuals` };
    }
    return null;
  }

  validateEndAtDate(startAt: moment.Moment, endAt: moment.Moment): { [key: string]: any } | null {
    if (endAt && startAt && endAt.valueOf() < startAt.valueOf()) {
      return { error: `Cannot set end date before ${moment.utc(startAt).format('M/D/YYYY')} start date` };
    } else if (
      endAt &&
      this.flightActualsDateBoundaries &&
      this.flightActualsDateBoundaries.endAt &&
      // end date + 1 days:
      //  * end date is fudged, i.e. actually stored as a cutoff of the next day at midnight
      //  * actuals boundary (last day actuals served) should match fudged end date/datepicker value,
      //  * BUT we're also allowing an extra day for straggling actuals
      this.flightActualsDateBoundaries.endAt.valueOf() > endAt.valueOf() + 24 * 60 * 60 * 1000
    ) {
      return { error: `Cannot set end date before ${moment.utc(this.flightActualsDateBoundaries.endAt).format('M/D/YYYY')} actuals` };
    } else {
      return null;
    }
  }

  // emits updates when reactive form fields change
  onFormValueChanges(flight: Flight) {
    if (!this.resetting) {
      this.flightUpdate.emit({
        flight,
        changed: this.flightForm.dirty,
        valid: this.flightForm.valid
      });
    }
  }

  // updates the form from @Input() set flight
  setFlightForm(flight: Flight) {
    // patch values onto the form
    this.flightForm.patchValue(flight, { emitEvent: false });
  }
}
