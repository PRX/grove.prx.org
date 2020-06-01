import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  MatIconModule,
  MatDatepickerModule,
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
import { Flight } from '../store/models';
import * as moment from 'moment';
import { Inventory } from '../../core/';
import { validateMp3 } from './flight-form-control-container.component';

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
  totalGoal: 123,
  zones: [{ id: 'pre_1' }],
  set_inventory_uri: '/some/inventory'
};
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
        (addZone)="onAddZone()"
        (removeZone)="onRemoveZone($event)"
      ></grove-flight-form>
    </form>
  `
})
class ParentFormComponent {
  constructor(private fb: FormBuilder) {}

  @ViewChild('childForm') childForm: FlightFormComponent;

  inventory = inventoryFixture;
  zoneOptions = inventoryFixture[0].zones;
  flight = flightFixture;
  softDeleted = false;
  flightDeleteToggle = jest.fn(() => {});
  flightDuplicate = jest.fn(() => {});
  addZone = jest.fn(() => {});
  removeZone = jest.fn(() => {});

  flightForm = this.fb.group({
    id: [],
    name: ['', Validators.required],
    startAt: ['', Validators.required],
    endAt: ['', Validators.required],
    contractStartAt: [''],
    contractEndAt: [''],
    zones: this.fb.array([this.fb.group({ id: ['', Validators.required], url: ['', validateMp3] })]),
    set_inventory_uri: ['', Validators.required]
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
        MatDatepickerModule,
        MatMomentDateModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [ParentFormComponent, FlightFormComponent],
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
});
