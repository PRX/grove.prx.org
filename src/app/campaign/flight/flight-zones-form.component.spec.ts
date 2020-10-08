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
        [isCompanion]="isCompanion"
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
    // adds a single empty zone if no flight zones
    parent.flightForm.setValue({ zones: [] });
    expect(component.zones.length).toEqual(1);
    parent.flightForm.setValue({ zones: [{}] });
    expect(component.zones.length).toEqual(1);
    parent.flightForm.reset({ zones: [{}, {}] });
    expect(component.zones.length).toEqual(2);
  });

  it('adds zone from the top most available option', () => {
    component.onAddZone();
    expect(component.zones.value).toEqual([
      { id: '', creativeFlightZones: [] },
      { id: component.zoneOptions[component.flightZones.length].id, creativeFlightZones: [] }
    ]);
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

  it('clears controls for empty zone', () => {
    component.writeValue([{ id: 'pre_1', creativeFlightZones: [{ weight: 1 }] }]);
    expect(component.zones.controls[0].get('id').value).toEqual('pre_1');
    expect((component.zones.controls[0].get('creativeFlightZones') as FormArray).controls[0].get('weight').value).toEqual(1);
    component.writeValue([]);
    expect(component.zones.controls[0].get('id').value).toEqual('');
    expect(component.zones.controls[0].get('creativeFlightZones').value).toEqual([]);
  });
});
