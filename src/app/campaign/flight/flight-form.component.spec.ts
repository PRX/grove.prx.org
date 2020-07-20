import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatCheckboxModule,
  MatButtonModule,
  MatIconModule,
  MatDatepickerModule,
  MatSlideToggleModule,
  MatMenuModule,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS
} from '@angular/material';
import {
  MatMomentDateModule,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS
} from '@angular/material-moment-adapter';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FlightFormComponent } from './flight-form.component';
import { FlightTargetsFormComponent } from './flight-targets-form.component';
import { FlightZonesFormComponent } from './flight-zones-form.component';
import { Flight, Inventory } from '../store/models';
import * as moment from 'moment';

const inventoryFixture: Inventory[] = [
  {
    id: 1,
    podcastTitle: 'some podcast',
    zones: [{ id: 'pre_1', label: 'Pre 1' }],
    self_uri: '/some/inventory'
  }
];
const flightFixture: Flight = {
  name: 'my-flight',
  startAt: moment.utc(),
  endAt: moment.utc(),
  endAtFudged: moment.utc().subtract(1, 'days'),
  totalGoal: 123,
  zones: [{ id: 'pre_1' }],
  targets: [],
  set_inventory_uri: '/some/inventory',
  deliveryMode: 'capped'
};

// arbitrary validator to produce an error for spec
export const cannotStartInPast = control => (control.value.valueOf() > Date.now() ? { error: 'start date cannot be in the past' } : null);
@Component({
  template: `
    <form [formGroup]="flightForm">
      <grove-flight-form
        #childForm
        [inventory]="inventory"
        [zoneOptions]="zoneOptions"
        [flight]="flight"
        [softDeleted]="softDeleted"
        (flightDeleteToggle)="flightDeleteToggle($event)"
        (flightDuplicate)="flightDuplicate($event)"
      ></grove-flight-form>
    </form>
  `
})
class ParentFormComponent {
  constructor(private fb: FormBuilder) {}

  @ViewChild('childForm', { static: true }) childForm: FlightFormComponent;

  inventory = inventoryFixture;
  zoneOptions = inventoryFixture[0].zones;
  flight = flightFixture;
  softDeleted = false;
  flightDeleteToggle = jest.fn(() => {});
  flightDuplicate = jest.fn(() => {});

  flightForm = this.fb.group({
    id: [],
    name: ['', Validators.required],
    startAt: ['', [Validators.required, cannotStartInPast]],
    endAtFudged: ['', Validators.required],
    contractStartAt: [''],
    contractEndAt: [''],
    contractEndAtFudged: [''],
    zones: [''],
    targets: [''],
    set_inventory_uri: ['', Validators.required],
    isCompanion: [false]
  });
}

describe('FlightFormComponent', () => {
  let parent: ParentFormComponent;
  let component: FlightFormComponent;
  let fixture: ComponentFixture<ParentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatButtonModule,
        MatIconModule,
        MatSlideToggleModule,
        MatMenuModule
      ],
      declarations: [ParentFormComponent, FlightFormComponent, FlightTargetsFormComponent, FlightZonesFormComponent],
      providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentFormComponent);
    parent = fixture.componentInstance;
    component = parent.childForm;
    fixture.detectChanges();
  });

  it('emits flight duplicate', done => {
    parent.flight = flightFixture;
    component.flightDuplicate.subscribe(toDup => {
      expect(toDup).toMatchObject(flightFixture);
      done();
    });
    component.onFlightDuplicate();
  });

  it('emits flight delete toggle', done => {
    component.flightDeleteToggle.subscribe(() => done());
    component.onFlightDeleteToggle();
  });

  it('checks for flight form errors', () => {
    component.flightForm.get('startAt').setValue(moment.utc().subtract(2, 'days'));
    component.flightForm.get('startAt').markAsTouched();
    expect(component.checkError('startAt')).toBeDefined();
  });
});
