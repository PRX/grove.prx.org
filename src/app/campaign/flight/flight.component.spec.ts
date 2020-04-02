import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FlightComponent } from './flight.component';
import { Flight } from '../store/models';
import { DatepickerModule } from 'ngx-prx-styleguide';

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
        DatepickerModule,
        MatButtonModule,
        MatIconModule
      ],
      declarations: [FlightComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    const today = new Date();
    const startAt = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const endAt = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, today.getDate()));
    flightFixture = {
      name: 'my-flight',
      startAt,
      endAt,
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

  it('preserves totalGoal when emitting form changes', done => {
    component.flight = flightFixture;
    component.flightUpdate.subscribe(flightUpdate => {
      expect(flightUpdate).toMatchObject({ flight: { totalGoal: flightFixture.totalGoal } });
      done();
    });
    component.flightForm.patchValue({ endAt: new Date() });
  });
});
