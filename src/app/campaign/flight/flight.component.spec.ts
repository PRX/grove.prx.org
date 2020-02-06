import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FlightComponent } from './flight.component';
import { Flight } from '../../core';

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
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [FlightComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    const today = new Date();
    const startAt = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const endAt = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1));
    startAt.setMinutes(today.getTimezoneOffset());
    endAt.setMinutes(today.getTimezoneOffset());
    flightFixture = {
      name: 'my-flight',
      startAt: startAt.toUTCString(),
      endAt: endAt.toUTCString(),
      totalGoal: 123,
      zones: [],
      set_inventory_uri: '/some/inventory'
    };
    fixture = TestBed.createComponent(FlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('updates the flight form', () => {
    const { totalGoal, ...flightFields } = flightFixture;
    component.flight = flightFixture;
    expect(component.flightForm.value).toMatchObject({
      ...flightFields,
      startAt: new Date(flightFixture.startAt),
      endAt: new Date(flightFixture.endAt)
    });
  });

  it('emits form changes', done => {
    component.flight = flightFixture;
    component.flightUpdate.subscribe(updates => {
      expect(updates).toMatchObject({ flight: { name: 'brand new name' } });
      done();
    });
    component.name.setValue('brand new name');
  });

  it('emits form changes dates at midnight UTC', done => {
    component.flight = flightFixture;
    component.flightUpdate.subscribe(updates => {
      const startAt = new Date(flightFixture.startAt);
      expect(updates).toMatchObject({
        flight: { startAt: new Date(Date.UTC(startAt.getFullYear(), startAt.getMonth(), startAt.getDate())).toUTCString() }
      });
      done();
    });
    component.flightForm.get('startAt').setValue(flightFixture.startAt);
  });

  it('preserves totalGoal when emitting form changes', done => {
    component.flight = flightFixture;
    component.flightUpdate.subscribe(flightUpdate => {
      expect(flightUpdate).toMatchObject({ flight: { totalGoal: flightFixture.totalGoal } });
      done();
    });
    component.flightForm.patchValue({ endAt: new Date() });
  });

  it('filters zones to reflect available options', () => {
    component.flight = { ...flightFixture, zones: ['pre_1', 'mid_1'] };
    expect(component.zones.value).toEqual(['pre_1', 'mid_1']);
    component.zoneOptions = [
      { id: 'pre_1', label: 'Preroll 1' },
      { id: 'post_1', label: 'Postroll 1' }
    ];
    expect(component.zones.value).toEqual(['pre_1']);
    component.zoneOptions = [];
    expect(component.zones.value).toEqual([]);
  });
});
