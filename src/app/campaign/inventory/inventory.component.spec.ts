import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { InventoryComponent } from './inventory.component';
import { InventoryTableComponent } from './inventory-table.component';
import { GoalFormComponent } from './goal-form.component';
import { InventoryZone } from '../store/models';
import { flightFixture } from '../store/models/campaign-state.factory';

const mockZones: InventoryZone[] = [{ id: 'pre_1', label: 'Preroll 1' }];
@Component({
  template: `
    <form [formGroup]="goalForm">
      <grove-inventory #childForm [flight]="flight" [zones]="zones"></grove-inventory>
    </form>
  `
})
class ParentFormComponent {
  constructor(private fb: FormBuilder) {}

  @ViewChild('childForm', { static: true }) childForm: InventoryComponent;

  flight = flightFixture;
  zones = mockZones;

  goalForm = this.fb.group({
    totalGoal: ['', Validators.min(0)],
    contractGoal: ['', Validators.min(0)],
    dailyMinimum: ['', Validators.min(0)],
    deliveryMode: ['', Validators.required]
  });
}

describe('InventoryComponent', () => {
  let parent: ParentFormComponent;
  let comp: InventoryComponent;
  let fix: ComponentFixture<ParentFormComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule
      ],
      declarations: [ParentFormComponent, InventoryComponent, InventoryTableComponent, GoalFormComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(ParentFormComponent);
        parent = fix.componentInstance;
        comp = parent.childForm;
        de = fix.debugElement;
        comp.flight = flightFixture;
        comp.zones = mockZones;
        fix.detectChanges();
      });
  }));

  it('gets zone name', () => {
    expect(comp.getZoneName('pre_1')).toEqual('Preroll 1');
  });

  it('should be truthy when flight data is incomplete or missing', () => {
    expect(comp.cantShowInventory()).toBeFalsy();

    comp.flight = null;
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...flightFixture,
      startAt: null
    };
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...flightFixture,
      endAt: null
    };
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...flightFixture,
      set_inventory_uri: null
    };
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...flightFixture,
      zones: null
    };
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...flightFixture,
      zones: []
    };
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...flightFixture,
      zones: [{ id: null }]
    };
    expect(comp.cantShowInventory()).toBeTruthy();
  });

  describe('errors', () => {
    it('has flight status messages', () => {
      expect(comp.errors).toEqual([]);
      comp.flight = { ...flightFixture, statusMessage: 'something bad' };
      expect(comp.errors).toEqual(['something bad']);
    });

    it('has flight preview errors', () => {
      expect(comp.errors).toEqual([]);
      comp.previewError = 'something bad';
      expect(comp.errors).toEqual(['something bad']);
    });

    it('decodes flight preview errors', () => {
      expect(comp.errors).toEqual([]);
      comp.previewError = { body: { message: 'something bad' } };
      expect(comp.errors).toEqual(['something bad']);
    });
  });
});
