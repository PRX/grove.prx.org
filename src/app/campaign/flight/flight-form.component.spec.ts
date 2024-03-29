import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  MatMomentDateModule,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS
} from '@angular/material-moment-adapter';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../../store/router-store/custom-router-serializer';
import { reducers } from '../store';
import { FlightFormComponent } from './flight-form.component';
import { FlightTargetsFormComponent } from './flight-targets-form.component';
import { FlightZonesFormComponent } from './flight-zones-form.component';
import { CreativeCardComponent } from '../creative/creative-card.component';
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
  status: 'approved',
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
      <grove-flight-form #childForm [inventory]="inventory" [zoneOptions]="zoneOptions" [flight]="flight"></grove-flight-form>
    </form>
  `
})
class ParentFormComponent {
  constructor(private fb: FormBuilder) {}

  @ViewChild('childForm', { static: true }) childForm: FlightFormComponent;

  inventory = inventoryFixture;
  zoneOptions = inventoryFixture[0].zones;
  flight = flightFixture;

  flightForm = this.fb.group({
    id: [],
    name: ['', Validators.required],
    status: ['', Validators.required],
    startAt: ['', [Validators.required, cannotStartInPast]],
    endAtFudged: ['', Validators.required],
    contractStartAt: [''],
    contractEndAt: [''],
    contractEndAtFudged: [''],
    zones: [''],
    targets: [''],
    notUniquePerCampaign: [false],
    notUniquePerAdvertiser: [false],
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
        RouterTestingModule.withRoutes([]),
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
        MatMenuModule,
        StoreModule.forRoot(
          { router: routerReducer },
          {
            runtimeChecks: {
              strictStateImmutability: true,
              strictActionImmutability: true
            }
          }
        ),
        StoreRouterConnectingModule.forRoot({ serializer: CustomRouterSerializer }),
        StoreModule.forFeature('campaignState', reducers)
      ],
      declarations: [ParentFormComponent, FlightFormComponent, FlightTargetsFormComponent, FlightZonesFormComponent, CreativeCardComponent],
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

  it('checks for flight form errors', () => {
    component.flightForm.get('startAt').setValue(moment.utc().subtract(2, 'days'));
    component.flightForm.get('startAt').markAsTouched();
    expect(component.checkError('startAt')).toBeDefined();
  });
});
