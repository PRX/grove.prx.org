import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormArray } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../../store/router-store/custom-router-serializer';
import { reducers } from '../store';
import { FlightZonesFormComponent } from './flight-zones-form.component';
import { CreativeCardComponent } from '../creative/creative-card.component';
import { FlightZone, InventoryZone } from '../store/models';

@Component({
  template: `
    <form [formGroup]="flightForm">
      <grove-flight-zones
        #childForm
        formControlName="zones"
        [flightZones]="flightZones"
        [zoneOptions]="options"
        [flightIsCompanion]="isCompanion"
        [flightStatus]="status"
      >
      </grove-flight-zones>
    </form>
  `
})
class ParentFormComponent {
  @ViewChild('childForm', { static: true }) childForm: FlightZonesFormComponent;
  constructor(private fb: FormBuilder) {}
  flightForm = this.fb.group({ zones: '' });
  options: InventoryZone[] = [
    { id: 'pre_1', label: 'Preroll 1' },
    { id: 'pre_2', label: 'Preroll 2' },
    { id: 'post_1', label: 'Postroll 1' }
  ];
  flightZones: FlightZone[] = [{ id: 'pre_1' }, { id: 'pre_2' }];
  isCompanion = false;
  status = 'hold';
}

describe('FlightZonesFormComponent', () => {
  let parent: ParentFormComponent;
  let component: FlightZonesFormComponent;
  let fixture: ComponentFixture<ParentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatCardModule,
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
      declarations: [ParentFormComponent, FlightZonesFormComponent, CreativeCardComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentFormComponent);
    parent = fixture.componentInstance;
    component = parent.childForm;
    fixture.detectChanges();
  });

  it('sets zones from the parent form', () => {
    parent.flightForm.setValue({ zones: [] });
    expect(component.zones.length).toEqual(0);
    parent.flightForm.setValue({ zones: [{}] });
    expect(component.zones.length).toEqual(1);
    parent.flightForm.reset({ zones: [{}, {}] });
    expect(component.zones.length).toEqual(2);
  });

  it('adds zones', () => {
    component.onAddZone({ id: 'mid_1' });
    expect(component.zones.value).toEqual([{ id: 'mid_1', creativeFlightZones: [] }]);
  });

  it('removes zones by index', () => {
    parent.flightForm.reset({
      zones: [{ id: 'pre_1' }, { id: 'pre_2' }]
    });
    expect(component.zones.value).toEqual([
      { id: 'pre_1', creativeFlightZones: [] },
      { id: 'pre_2', creativeFlightZones: [] }
    ]);
    component.onRemoveZone(0);
    expect(component.zones.value).toEqual([{ id: 'pre_2', creativeFlightZones: [] }]);
  });

  it('removes zones when there are more controls than zones', () => {
    parent.flightForm.reset({
      zones: [{ id: 'pre_1' }, { id: 'pre_2' }]
    });
    expect(component.zones.value).toEqual([
      { id: 'pre_1', creativeFlightZones: [] },
      { id: 'pre_2', creativeFlightZones: [] }
    ]);
    component.writeValue([{ id: 'pre_2' }]);
    expect(component.zones.value).toEqual([{ id: 'pre_2', creativeFlightZones: [] }]);
  });

  it('does not emit while receiving incoming update', () => {
    jest.spyOn(component, 'onChangeFn');
    component.writeValue([{ id: 'pre_1' }, { id: 'pre_2' }]);
    expect(component.onChangeFn).not.toHaveBeenCalled();
    component.writeValue([{ id: 'pre_1' }]);
    expect(component.onChangeFn).not.toHaveBeenCalled();
  });

  it('validates for non-draft flights', () => {
    component.flightStatus = 'approved';
    component.writeValue([]);
    expect(component.validateHasZones()).toEqual({ noZones: true });
  });

  it('validates zones for non-draft flights', () => {
    component.flightStatus = 'approved';

    component.writeValue([{ id: 'pre_1' }]);
    expect(component.zones.at(0).errors).toEqual({ noCreatives: true });

    component.writeValue([{ id: 'pre_1', creativeFlightZones: [{ enabled: false }] }]);
    expect(component.zones.at(0).errors).toEqual({ noEnabledCreatives: true });
  });

  it('validates zones for companion flights', () => {
    component.flightStatus = 'approved';
    component.flightIsCompanion = true;

    component.writeValue([
      { id: 'pre_1', creativeFlightZones: [{}, {}] },
      { id: 'post_1', creativeFlightZones: [{}] }
    ]);
    expect(component.zones.at(1).errors).toEqual({ mismatchedCompanionZones: true });

    component.writeValue([
      { id: 'pre_1', creativeFlightZones: [{}, {}] },
      { id: 'post_1', creativeFlightZones: [{}, { disabled: true }] }
    ]);
    expect(component.zones.at(1).errors).toEqual({ mismatchedCompanionZones: true });

    component.writeValue([
      { id: 'pre_1', creativeFlightZones: [{ weight: 50 }] },
      { id: 'post_1', creativeFlightZones: [{ weight: 100 }] }
    ]);
    expect(component.zones.at(1).errors).toEqual({ mismatchedCompanionZones: true });

    component.writeValue([
      { id: 'pre_1', creativeFlightZones: [{ weight: 10 }] },
      { id: 'post_1', creativeFlightZones: [{ weight: 10 }] }
    ]);
    expect(component.zones.at(1).errors).toBeFalsy();
  });
});
