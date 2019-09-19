import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule
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
        MatNativeDateModule
      ],
      declarations: [FlightComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    flightFixture = {
      name: 'my-flight',
      startAt: new Date().toISOString(),
      endAt: new Date().toISOString(),
      totalGoal: 123,
      set_inventory_uri: '/some/inventory'
    };
    fixture = TestBed.createComponent(FlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('updates the flight form', () => {
    component.flight = flightFixture;
    component.ngOnChanges({
      flight: { previousValue: null, currentValue: flightFixture, firstChange: true, isFirstChange: () => true }
    });
    expect(component.flightForm.value).toMatchObject({
      ...flightFixture,
      startAt: new Date(flightFixture.startAt),
      endAt: new Date(flightFixture.endAt)
    });
  });

  it('emits form changes', done => {
    component.flight = flightFixture;
    component.ngOnChanges({
      flight: { previousValue: null, currentValue: flightFixture, firstChange: true, isFirstChange: () => true }
    });

    component.flightUpdate.subscribe(updates => {
      expect(updates).toMatchObject({ flight: { name: 'brand new name' } });
      done();
    });
    component.name.setValue('brand new name');
  });
});
