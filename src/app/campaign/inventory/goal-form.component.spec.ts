import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { GoalFormComponent } from './goal-form.component';
@Component({
  template: `
    <form [formGroup]="goalForm">
      <grove-goal-form #childForm></grove-goal-form>
    </form>
  `
})
class ParentFormComponent {
  constructor(private fb: FormBuilder) {}

  @ViewChild('childForm') childForm: GoalFormComponent;

  goalForm = this.fb.group({
    totalGoal: ['', Validators.min(0)],
    contractGoal: ['', Validators.min(0)],
    dailyMinimum: ['', Validators.min(0)],
    deliveryMode: ['', Validators.required]
  });
}

describe('GoalFormComponent', () => {
  let parent: ParentFormComponent;
  let comp: GoalFormComponent;
  let fix: ComponentFixture<ParentFormComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
      declarations: [ParentFormComponent, GoalFormComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(ParentFormComponent);
        parent = fix.componentInstance;
        comp = parent.childForm;
        de = fix.debugElement;
        fix.detectChanges();
      });
  }));

  it('show form controls based on delivery mode', () => {
    comp.goalForm.get('deliveryMode').setValue('capped');
    fix.detectChanges();
    expect(de.query(By.css('input[formcontrolname="totalGoal"]')).nativeElement).toBeDefined();
    expect(de.query(By.css('input[formcontrolname="dailyMinimum"]')).nativeElement).toBeDefined();

    comp.goalForm.get('deliveryMode').setValue('uncapped');
    fix.detectChanges();
    expect(de.query(By.css('input[formcontrolname="totalGoal"]')).nativeElement).toBeDefined();
    expect(de.query(By.css('input[formcontrolname="dailyMinimum"]'))).toBeNull();

    comp.goalForm.get('deliveryMode').setValue('greedy_uncapped');
    fix.detectChanges();
    expect(de.query(By.css('input[formcontrolname="totalGoal"]'))).toBeNull();
    expect(de.query(By.css('input[formcontrolname="dailyMinimum"]'))).toBeNull();
  });

  it('resets the daily minimum based on velocity', () => {
    comp.goalForm.get('totalGoal').setValue(100);
    comp.goalForm.get('dailyMinimum').setValue(10);

    comp.setVelocity('fastly');
    expect(comp.dailyMinimum).toEqual(100);

    comp.setVelocity('evenly');
    expect(comp.dailyMinimum).toEqual('');
  });

  it('changes velocity based on daily minimum', () => {
    comp.goalForm.get('totalGoal').setValue(100);
    comp.goalForm.get('dailyMinimum').setValue(10);
    expect(comp.getVelocity()).toEqual('');

    comp.goalForm.get('dailyMinimum').setValue(100);
    expect(comp.getVelocity()).toEqual('fastly');

    comp.goalForm.get('dailyMinimum').setValue(0);
    expect(comp.getVelocity()).toEqual('evenly');
  });
});
