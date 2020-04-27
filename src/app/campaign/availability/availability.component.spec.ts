import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { AvailabilityComponent } from './availability.component';
import { GoalFormComponent } from './goal-form.component';
import { InventoryZone } from '../../core';
import { Flight, AvailabilityRollup } from '../store/models';
import { availabilityParamsFixture } from '../store/models/campaign-state.factory';
import * as moment from 'moment';

describe('AvailabilityComponent', () => {
  let comp: AvailabilityComponent;
  let fix: ComponentFixture<AvailabilityComponent>;
  let de: DebugElement;

  const mockRollup: AvailabilityRollup = {
    params: availabilityParamsFixture,
    totals: { allocated: 31, availability: 3463, actuals: 0, allocationPreview: 33 },
    weeks: [
      {
        startDate: new Date('2019-10-01'),
        endDate: new Date('2019-10-05'),
        numbers: { allocated: 1, availability: 1, actuals: 0, allocationPreview: 3 },
        days: []
      },
      {
        startDate: new Date('2019-10-06'),
        endDate: new Date('2019-10-12'),
        numbers: { allocated: 9, availability: 1339, actuals: 0, allocationPreview: 9 },
        days: []
      },
      {
        startDate: new Date('2019-10-13'),
        endDate: new Date('2019-10-19'),
        numbers: { allocated: 8, availability: 8, actuals: 0, allocationPreview: 8 },
        days: []
      },
      {
        startDate: new Date('2019-10-20'),
        endDate: new Date('2019-10-26'),
        numbers: { allocated: 7, availability: 1393, actuals: 0, allocationPreview: 7 },
        days: []
      },
      {
        startDate: new Date('2019-10-27'),
        endDate: new Date('2019-10-31'),
        numbers: { allocated: 6, availability: 722, actuals: 0, allocationPreview: 6 },
        days: []
      }
    ]
  };
  const mockFlight: Flight = {
    id: 9,
    name: 'my flight name',
    startAt: moment.utc('2019-10-01'),
    endAt: moment.utc('2019-11-01'),
    totalGoal: 999,
    zones: [{ id: 'pre_1', label: 'Preroll 1' }],
    set_inventory_uri: '/some/inventory'
  };
  const mockZones: InventoryZone[] = [{ id: 'pre_1', label: 'Preroll 1' }];
  const mockRollups = [mockRollup];

  const rollup = mockRollup;
  const week = mockRollup.weeks[0];

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
      declarations: [AvailabilityComponent, GoalFormComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(AvailabilityComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        comp.flight = mockFlight;
        comp.zones = mockZones;
        comp.rollups = mockRollups;
        fix.detectChanges();
      });
  }));

  it('gets zone name', () => {
    expect(comp.getZoneName('pre_1')).toEqual('Preroll 1');
  });

  it('should return zone week key name', () => {
    expect(comp.getZoneWeekKey(rollup.params, week)).toEqual('pre_1-2019-10-01');
  });

  it('toggles week expanded', () => {
    expect(comp.zoneWeekExpanded['pre_1-2019-10-01']).toBeFalsy();
    comp.toggleZoneWeekExpanded(rollup, week);
    expect(comp.zoneWeekExpanded['pre_1-2019-10-01']).toBeTruthy();
  });

  it('should check zone week expanded status', () => {
    expect(comp.isZoneWeekExpanded(rollup, week)).toBeFalsy();
    comp.toggleZoneWeekExpanded(rollup, week);
    expect(comp.isZoneWeekExpanded(rollup, week)).toBeTruthy();
  });

  it('should be truthy when flight data is incomplete or missing', () => {
    expect(comp.cantShowInventory()).toBeFalsy();

    comp.flight = null;
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...mockFlight,
      startAt: null
    };
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...mockFlight,
      endAt: null
    };
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...mockFlight,
      set_inventory_uri: null
    };
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...mockFlight,
      zones: null
    };
    expect(comp.cantShowInventory()).toBeTruthy();

    comp.flight = {
      ...mockFlight,
      zones: []
    };
    expect(comp.cantShowInventory()).toBeTruthy();
  });

  it('highlights rows where more allocated than available', () => {
    const row = de.query(By.css('.row-highlight'));
    expect(row).toBeDefined();
    expect(row.nativeElement.textContent).toContain('10/01');
  });

  it('should return truthy when preview exceeds available', () => {
    expect(comp.allocationPreviewExceedsAvailable(week.numbers)).toBeTruthy();
    expect(comp.allocationPreviewExceedsAvailable({ ...week.numbers, allocated: 9 })).toBeFalsy();
  });

  it('should return truthy when preview allocations exist after change', () => {
    expect(comp.hasAllocationPreviewAfterChange(week.numbers.allocationPreview)).toBeFalsy();
    comp.changed = true;
    expect(comp.hasAllocationPreviewAfterChange(week.numbers.allocationPreview)).toBeTruthy();
  });

  it('should return correct allocation value', () => {
    expect(comp.getAllocationValue(week.numbers)).toEqual(week.numbers.allocated);
    comp.changed = true;
    expect(comp.getAllocationValue(week.numbers)).toEqual(week.numbers.allocationPreview);
  });

  it('should return combined value of allocated and availability', () => {
    expect(comp.getAvailableValue(week.numbers)).toEqual(week.numbers.allocated + week.numbers.availability);
  });
});
