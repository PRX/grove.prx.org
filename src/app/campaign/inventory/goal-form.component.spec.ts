import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule, MatInputModule, MatSlideToggleModule } from '@angular/material';
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

  @ViewChild('childForm', { static: true }) childForm: GoalFormComponent;

  goalForm = this.fb.group({
    totalGoal: [0, [Validators.required, Validators.min(0)]],
    contractGoal: ['', Validators.min(0)],
    dailyMinimum: [0, Validators.min(0)],
    uncapped: [false]
  });
}

describe('GoalFormComponent', () => {
  let parent: ParentFormComponent;
  let comp: GoalFormComponent;
  let fix: ComponentFixture<ParentFormComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule],
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

  it('show form controls based on capped/uncapped form field value', () => {
    comp.goalForm.get('uncapped').setValue(false);
    expect(de.query(By.css('input[formcontrolname="totalGoal"]')).nativeElement).toBeDefined();
    comp.goalForm.get('uncapped').setValue(true);
    fix.detectChanges();
    expect(de.query(By.css('input[formcontrolname="totalGoal"]'))).toBeNull();
    expect(de.query(By.css('.warn')).nativeElement).toBeDefined();
  });
});
