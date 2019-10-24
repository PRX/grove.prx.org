import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { GoalFormComponent } from './goal-form.component';

describe('GoalFormComponent', () => {
  let comp: GoalFormComponent;
  let fix: ComponentFixture<GoalFormComponent>;
  let de: DebugElement;

  const flight = {
    id: 9,
    name: 'my flight name',
    startAt: '2019-10-01',
    endAt: '2019-11-01',
    totalGoal: 999,
    zones: ['pre_1'],
    set_inventory_uri: '/some/inventory'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
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
      expect(change).toMatchObject({ dailyMinimum: 90, flight });
      done();
    });
    comp.goalForm.get('dailyMinimum').setValue(90);
  });
});
