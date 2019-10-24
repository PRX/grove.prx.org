import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { AvailabilityComponent } from './availability.component';
import { GoalFormComponent } from './goal-form.component';

describe('AvailabilityComponent', () => {
  let comp: AvailabilityComponent;
  let fix: ComponentFixture<AvailabilityComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
      declarations: [AvailabilityComponent, GoalFormComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(AvailabilityComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        comp.flight = {
          id: 9,
          name: 'my flight name',
          startAt: '2019-10-01',
          endAt: '2019-11-01',
          totalGoal: 999,
          zones: ['pre_1'],
          set_inventory_uri: '/some/inventory'
        };
        comp.zones = [{ id: 'pre_1', label: 'Preroll 1' }];
        comp.availabilityZones = [
          {
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
          }
        ];
        fix.detectChanges();
      });
  }));

  it('gets zone name', () => {
    expect(comp.getZoneName('pre_1')).toEqual('Preroll 1');
  });

  it('toggles week expanded', () => {
    comp.toggleZoneWeekExpanded('pre_1', '2019-10-06');
    expect(comp.zoneWeekExpanded['pre_1-2019-10-06']).toBeTruthy();
  });

  it('toggle week hover', () => {
    comp.toggleZoneWeekHover('pre_1', '2019-10-13');
    expect(comp.zoneWeekHover['pre_1-2019-10-13']).toBeTruthy();
  });

  it('highlights rows were more allocated than available', () => {
    const row = de.query(By.css('.row-highlight'));
    expect(row).toBeDefined();
    expect(row.nativeElement.textContent).toContain('10/01');
  });
});
