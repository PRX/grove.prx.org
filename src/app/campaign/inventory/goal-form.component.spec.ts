import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule, MatInputModule, MatSlideToggleModule } from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { GoalFormComponent } from './goal-form.component';
import * as moment from 'moment';

describe('GoalFormComponent', () => {
  let comp: GoalFormComponent;
  let fix: ComponentFixture<GoalFormComponent>;
  let de: DebugElement;

  const flight = {
    id: 9,
    name: 'my flight name',
    startAt: moment.utc(),
    endAt: moment.utc(),
    totalGoal: 999,
    zones: [{ id: 'pre_1', label: 'Preroll 1' }],
    set_inventory_uri: '/some/inventory'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule],
      declarations: [GoalFormComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(GoalFormComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        fix.detectChanges();
      });
  }));

  it('updates the goal form from flight', () => {
    comp.flight = flight;
    expect(comp.goalForm.value).toMatchObject({ totalGoal: flight.totalGoal });
  });

  it('emits form changes', done => {
    comp.flight = flight;
    comp.goalChange.subscribe(change => {
      expect(change).toMatchObject({ ...flight, dailyMinimum: 90 });
      done();
    });
    comp.goalForm.get('dailyMinimum').setValue(90);
  });

  it('sets the goals to 0 for uncapped flights', done => {
    comp.flight = flight;
    comp.goalChange.subscribe(change => {
      expect(change).toMatchObject({ ...flight, dailyMinimum: 0, totalGoal: 0, uncapped: true });
      done();
    });
    comp.goalForm.get('uncapped').setValue(true);
  });
});
