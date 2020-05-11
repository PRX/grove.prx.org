import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { InventoryComponent } from './inventory.component';
import { InventoryTableComponent } from './inventory-table.component';
import { GoalFormComponent } from './goal-form.component';
import { InventoryZone } from '../../core';
import { flightFixture } from '../store/models/campaign-state.factory';

describe('InventoryComponent', () => {
  let comp: InventoryComponent;
  let fix: ComponentFixture<InventoryComponent>;
  let de: DebugElement;
  const mockZones: InventoryZone[] = [{ id: 'pre_1', label: 'Preroll 1' }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      declarations: [InventoryComponent, InventoryTableComponent, GoalFormComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(InventoryComponent);
        comp = fix.componentInstance;
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
  });
});
