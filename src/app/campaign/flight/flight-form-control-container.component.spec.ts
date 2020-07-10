import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatCheckboxModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatDatepickerModule,
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
import { SharedModule } from '../../shared/shared.module';
import { FlightFormControlContainerComponent } from './flight-form-control-container.component';
import { FlightFormComponent } from './flight-form.component';
import { FlightTargetsFormComponent } from './flight-targets-form.component';
import { FlightZonesFormComponent } from './flight-zones-form.component';
import { InventoryComponent } from '../inventory/inventory.component';
import { InventoryTableComponent } from '../inventory/inventory-table.component';
import { GoalFormComponent } from '../inventory/goal-form.component';
import { Flight } from '../store/models';
import * as moment from 'moment';

const flightFixture: Flight = {
  name: 'my-flight',
  startAt: moment.utc(),
  endAt: moment.utc(),
  endAtFudged: moment.utc().subtract(1, 'days'),
  deliveryMode: 'capped',
  totalGoal: 123,
  zones: [{ id: 'pre_1' }],
  set_inventory_uri: '/some/inventory'
};

describe('FlightFormControlContainerComponent', () => {
  let component: FlightFormControlContainerComponent;
  let fixture: ComponentFixture<FlightFormControlContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        MatMenuModule,
        SharedModule
      ],
      declarations: [
        FlightFormControlContainerComponent,
        FlightFormComponent,
        FlightTargetsFormComponent,
        FlightZonesFormComponent,
        InventoryComponent,
        InventoryTableComponent,
        GoalFormComponent
      ],
      providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightFormControlContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('updates the flight form', () => {
    component.flight = flightFixture;
    const { endAt, ...flight } = flightFixture;
    expect(component.flightForm.value).toMatchObject(flight);
  });

  it('updates the total goal from flight', () => {
    component.flight = { ...flightFixture, totalGoal: 19 };
    expect(component.flightForm.get('totalGoal').value).toEqual(19);
  });

  it('should validate flight goals', () => {
    component.flight = flightFixture;
    expect(component.flightForm.valid).toBeTruthy();

    component.flight = { ...flightFixture, totalGoal: -1 };
    expect(component.flightForm.valid).toBeFalsy();

    component.flight = { ...flightFixture, dailyMinimum: -1 };
    expect(component.flightForm.valid).toBeFalsy();
  });

  it('emits form changes', done => {
    component.flight = flightFixture;
    component.flightUpdate.subscribe(updates => {
      expect(updates).toMatchObject({ flight: { name: 'brand new name' } });
      done();
    });
    component.flightForm.get('name').setValue('brand new name');
  });

  it('disables controls on soft delete', () => {
    component.flight = flightFixture;
    expect(component.flightForm.get('name').disabled).toEqual(false);
    component.softDeleted = true;
    expect(component.flightForm.get('name').disabled).toEqual(true);
    component.softDeleted = false;
    expect(component.flightForm.get('name').disabled).toEqual(false);
  });
});
