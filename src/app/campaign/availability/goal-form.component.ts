import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Flight } from '../store/models';

@Component({
  selector: 'grove-goal-form',
  template: `
    <form class="goal-form" [formGroup]="goalForm" ngNativeValidate>
      <mat-form-field appearance="outline">
        <mat-label>Total Goal</mat-label>
        <input type="number" matInput placeholder="Total Goal" formControlName="totalGoal" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Daily Minimum</mat-label>
        <input type="number" matInput placeholder="Daily Minimum" formControlName="dailyMinimum" />
      </mat-form-field>
    </form>
  `,
  styleUrls: ['goal-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalFormComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line
  private _flight: Flight;
  get flight(): Flight {
    return this._flight;
  }
  @Input()
  set flight(flight: Flight) {
    if (flight) {
      this._flight = flight;
      this.updateGoalForm(flight);
    }
  }
  @Output() goalChange = new EventEmitter<Flight>();
  goalForm = this.fb.group({
    id: [''],
    totalGoal: ['', Validators.required],
    dailyMinimum: ['']
  });
  goalFormSub: Subscription;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.goalFormSub = this.goalForm.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged((a, b) => {
          return a.totalGoal === b.totalGoal && a.dailyMinimum === b.dailyMinimum;
        })
      )
      .subscribe(cmp => {
        this.formStatusChanged(cmp);
      });
  }

  ngOnDestroy() {
    if (this.goalFormSub) {
      this.goalFormSub.unsubscribe();
    }
  }

  formStatusChanged(formFields) {
    const totalGoal = formFields.totalGoal && +formFields.totalGoal;
    const dailyMinimum = formFields.dailyMinimum && +formFields.dailyMinimum;
    this.goalChange.emit({
      ...this.flight,
      id: formFields.id,
      totalGoal,
      dailyMinimum
    });
  }

  updateGoalForm({ id, totalGoal, dailyMinimum }: Flight) {
    this.goalForm.patchValue({ id, totalGoal, dailyMinimum }, { emitEvent: false, onlySelf: true });
  }
}
