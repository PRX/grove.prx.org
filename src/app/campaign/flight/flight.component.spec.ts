import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { FlightComponent } from './flight.component';
import { Flight } from '../store/models';
import * as moment from 'moment';

describe('FlightComponent', () => {
  let component: FlightComponent;
  let fixture: ComponentFixture<FlightComponent>;
  let flightFixture: Flight;

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
      declarations: [FlightComponent],
      providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    flightFixture = {
      name: 'my-flight',
      startAt: moment.utc(),
      endAt: moment.utc(),
      totalGoal: 123,
      zones: [{ id: 'pre_1' }],
      set_inventory_uri: '/some/inventory'
    };
    fixture = TestBed.createComponent(FlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('updates the flight form', () => {
    const { totalGoal, ...formFields } = flightFixture;
    component.flight = flightFixture;
    expect(component.flightForm.value).toMatchObject(formFields);
  });

  it('emits form changes', done => {
    component.flight = flightFixture;
    component.flightUpdate.subscribe(updates => {
      expect(updates).toMatchObject({ flight: { name: 'brand new name' } });
      done();
    });
    component.name.setValue('brand new name');
  });

  it('emits flight duplicate', done => {
    component.flight = flightFixture;
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

  it('disables controls on soft delete', () => {
    component.flight = flightFixture;
    expect(component.name.disabled).toEqual(false);
    component.softDeleted = true;
    expect(component.name.disabled).toEqual(true);
    component.softDeleted = false;
    expect(component.name.disabled).toEqual(false);
  });

  it('filters zone options based on the current zone', () => {
    component.flight = flightFixture;
    component.flight.zones.push({ id: 'post_1' });
    component.zoneOptions = [
      { id: 'pre_1', label: 'Preroll 1' },
      { id: 'pre_2', label: 'Preroll 2' },
      { id: 'post_1', label: 'Postroll 1' },
      { id: 'post_2', label: 'Postroll 2' }
    ];
    expect(component.zoneOptionsFiltered().map(z => z.id)).toEqual(['pre_2', 'post_2']);
    expect(component.zoneOptionsFiltered(0).map(z => z.id)).toEqual(['pre_1', 'pre_2', 'post_2']);
    expect(component.zoneOptionsFiltered(1).map(z => z.id)).toEqual(['pre_2', 'post_1', 'post_2']);
  });

  it('defaults zone options to the current zone', () => {
    component.flight = flightFixture;
    component.zoneOptions = null;
    expect(component.zoneOptionsFiltered()).toEqual([]);
    expect(component.zoneOptionsFiltered(0)).toEqual(flightFixture.zones);
  });

  it('updates zone controls to match the flight', () => {
    component.flight = { ...flightFixture, zones: [{ id: 'pre_1' }, { id: 'pre_2', url: 'http://file.mp3' }] };
    expect(component.zones.value).toEqual([
      { id: 'pre_1', url: null },
      { id: 'pre_2', url: 'http://file.mp3' }
    ]);

    // should keep 1 around - can't have 0 zones
    component.flight = { ...flightFixture, zones: [] };
    expect(component.zones.value).toEqual([{ id: null, url: null }]);
  });

  it('adds and removes zone controls', () => {
    component.flight = flightFixture;
    component.zoneOptions = [
      { id: 'pre_1', label: 'Preroll 1' },
      { id: 'pre_2', label: 'Preroll 2' }
    ];
    expect(component.zones.value).toEqual([{ id: 'pre_1', url: null }]);

    component.onAddZone();
    expect(component.zones.value).toEqual([
      { id: 'pre_1', url: null },
      { id: 'pre_2', url: null }
    ]);

    component.onRemoveZone(0);
    expect(component.zones.value).toEqual([{ id: 'pre_2', url: null }]);
  });

  it('does very basic mp3 validations', () => {
    component.flight = flightFixture;

    const zone = component.zones.at(0);
    const urlField = zone.get('url');

    urlField.setValue('');
    expect(urlField.errors).toEqual(null);

    urlField.setValue('http://this.looks/valid.mp3');
    expect(urlField.errors).toEqual(null);
    expect(component.checkInvalidUrl(zone, 'invalidUrl')).toEqual(false);
    expect(component.checkInvalidUrl(zone, 'notMp3')).toEqual(false);

    urlField.setValue('ftp://this.is/invalid.mp3');
    expect(urlField.errors).toEqual({ invalidUrl: { value: 'ftp://this.is/invalid.mp3' } });
    expect(component.checkInvalidUrl(zone, 'invalidUrl')).toEqual(true);

    urlField.setValue('http://this.is/notaudio.jpg');
    expect(urlField.errors).toEqual({ notMp3: { value: 'http://this.is/notaudio.jpg' } });
    expect(component.checkInvalidUrl(zone, 'notMp3')).toEqual(true);
  });
});
