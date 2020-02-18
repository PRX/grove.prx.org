import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { AvailabilityComponent } from './availability.component';
import { GoalFormComponent } from './goal-form.component';
import { Flight, InventoryZone, Availability } from '../../core';

describe('AvailabilityComponent', () => {
  let comp: AvailabilityComponent;
  let fix: ComponentFixture<AvailabilityComponent>;
  let de: DebugElement;

  const mockAvailabilityZone = {
    zone: 'pre_1',
    totals: {
      startDate: '2019-10-01',
      endDate: '2019-11-01',
      groups: [
        { allocated: 1, availability: 1, allocationPreview: 3, startDate: '2019-10-01', endDate: '2019-10-05' },
        { allocated: 9, availability: 1339, allocationPreview: 9, startDate: '2019-10-06', endDate: '2019-10-12' },
        { allocated: 8, availability: 8, allocationPreview: 8, startDate: '2019-10-13', endDate: '2019-10-19' },
        { allocated: 7, availability: 1393, allocationPreview: 7, startDate: '2019-10-20', endDate: '2019-10-26' },
        { allocated: 6, availability: 722, allocationPreview: 6, startDate: '2019-10-27', endDate: '2019-10-31' }
      ]
    }
  };
  const mockFlight = {
    id: 9,
    name: 'my flight name',
    startAt: '2019-10-01',
    endAt: '2019-11-01',
    totalGoal: 999,
    zones: ['pre_1'],
    set_inventory_uri: '/some/inventory'
  };
  const mockZones = [{ id: 'pre_1', label: 'Preroll 1' }];
  const mockAvailabilityZones = [mockAvailabilityZone];

  const zone = mockAvailabilityZone;
  const week = mockAvailabilityZone.totals.groups[0];

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
        comp.availabilityZones = mockAvailabilityZones;
        fix.detectChanges();
      });
  }));

  it('gets zone name', () => {
    expect(comp.getZoneName('pre_1')).toEqual('Preroll 1');
  });

  it('should return zone week key name', () => {
    expect(comp.getZoneWeekKey(zone, week)).toEqual('pre_1-2019-10-01');
  });

  it('toggles week expanded', () => {
    expect(comp.zoneWeekExpanded['pre_1-2019-10-01']).toBeFalsy();
    comp.toggleZoneWeekExpanded(zone, week);
    expect(comp.zoneWeekExpanded['pre_1-2019-10-01']).toBeTruthy();
  });

  it('should check zone week expanded status', () => {
    expect(comp.isZoneWeekExpanded(zone, week)).toBeFalsy();
    comp.toggleZoneWeekExpanded(zone, week);
    expect(comp.isZoneWeekExpanded(zone, week)).toBeTruthy();
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

  it('should return truthy when preview allocations exist after change', () => {
    expect(comp.hasAllocationPrevieweAfterChange(week)).toBeFalsy();
    comp.changed = true;
    expect(comp.hasAllocationPrevieweAfterChange(week)).toBeTruthy();
  });

  it('should return correct allocation value', () => {
    expect(comp.getAllocationValue(week)).toEqual(1);
    comp.changed = true;
    expect(comp.getAllocationValue(week)).toEqual(3);
  });

  it('should return number of zone groups or zero', () => {
    expect(comp.getDaysForWeek(week)).toEqual(0)
    expect(comp.getDaysForWeek({ ...week, groups: [week] })).toEqual(1)
  });

  it('should return combined value of allocated and availability', () => {
    expect(comp.getAvailable(week)).toEqual(2);
  });

  it('should return truthy when preview exceeds availabile', () => {
    expect(comp.allocationPreviewExceedsAvailable(week)).toBeTruthy();
    expect(comp.allocationPreviewExceedsAvailable({ ...week, allocated: 9 })).toBeFalsy();
  });
});
