import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule } from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { InventoryTableComponent } from './inventory-table.component';
import { InventoryRollup } from '../store/models';
import { flightPreviewParams, flightFixture } from '../store/models/campaign-state.factory';

describe('InventoryTableComponent', () => {
  let comp: InventoryTableComponent;
  let fix: ComponentFixture<InventoryTableComponent>;
  let de: DebugElement;

  const mockRollup: InventoryRollup = {
    previewParams: flightPreviewParams,
    totals: { allocated: 31, available: 3463, actuals: 0, inventory: 3463 },
    weeks: [
      {
        startDate: new Date('2019-10-01'),
        endDate: new Date('2019-10-05'),
        numbers: { allocated: 1, available: -1, actuals: 4, inventory: 0 },
        days: [
          {
            date: new Date('2019-10-01'),
            numbers: { allocated: 1, available: -1, actuals: 4, inventory: 0 },
            borked: true
          }
        ]
      },
      {
        startDate: new Date('2019-10-06'),
        endDate: new Date('2019-10-12'),
        numbers: { allocated: 9, available: 1348, actuals: 0, inventory: 1348 },
        days: []
      },
      {
        startDate: new Date('2019-10-13'),
        endDate: new Date('2019-10-19'),
        numbers: { allocated: 8, available: 16, actuals: 0, inventory: 16 },
        days: []
      },
      {
        startDate: new Date('2019-10-20'),
        endDate: new Date('2019-10-26'),
        numbers: { allocated: 7, available: 1400, actuals: 0, inventory: 1400 },
        days: []
      },
      {
        startDate: new Date('2019-10-27'),
        endDate: new Date('2019-10-31'),
        numbers: { allocated: 6, available: 728, actuals: 0, inventory: 728 },
        days: []
      }
    ]
  };

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
      declarations: [InventoryTableComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(InventoryTableComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        comp.flight = flightFixture;
        comp.rollup = mockRollup;
        fix.detectChanges();
      });
  }));

  describe('zone week expanded', () => {
    const week = mockRollup.weeks[0];

    it('toggles week expanded', () => {
      expect(comp.zoneWeekExpanded[week.startDate.toISOString().slice(0, 10)]).toBeFalsy();
      comp.toggleZoneWeekExpanded(week);
      expect(comp.zoneWeekExpanded[week.startDate.toISOString().slice(0, 10)]).toBeTruthy();
    });

    it('should check zone week expanded status', () => {
      expect(comp.isZoneWeekExpanded(week)).toBeFalsy();
      comp.toggleZoneWeekExpanded(week);
      expect(comp.isZoneWeekExpanded(week)).toBeTruthy();
    });
  });

  it('highlights rows that are borked', () => {
    const row = de.query(By.css('.row-highlight'));
    expect(row).toBeDefined();
    expect(row.nativeElement.textContent).toContain('10/01');
  });

  it('should indicate when showing a flight preview', () => {
    comp.isPreview = true;
    fix.detectChanges();
    expect(de.query(By.css('.preview'))).toBeDefined();
  });

  it('should show a week as the current week when not expanded', () => {
    expect(comp.isZoneWeekExpanded(mockRollup.weeks[0])).toBeFalsy();
    expect(comp.showAsCurrentWeek(mockRollup.weeks[0])).toBeFalsy();
  });

  it('should show a date in the past', () => {
    expect(comp.showAsPastDate(new Date('2019-12-31'))).toBeTruthy();
  });

  it('should show a date as the current date', () => {
    expect(comp.showAsCurrentDate(new Date())).toBeTruthy();
  });
});
