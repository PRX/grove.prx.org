import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Flight } from '../../core';

@Component({
  selector: 'grove-goal-form',
  template: `
    <form [formGroup]="goalForm" ngNativeValidate>
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
      this.updateGoalForm(this._flight.totalGoal);
    }
  }
  @Output() goalChange = new EventEmitter<{ flight: Flight; dailyMinimum: number }>();
  goalForm = this.fb.group({
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
    // allow totalGoal to be null but set dailyMinimum to 0 if not set
    const totalGoal = formFields.totalGoal && +formFields.totalGoal;
    const dailyMinimum = formFields.dailyMinimum ? +formFields.dailyMinimum : 0;
    this.goalChange.emit({
      flight: { ...this.flight, totalGoal },
      dailyMinimum
    });
  }

  updateGoalForm(totalGoal) {
    this.goalForm.patchValue({ totalGoal }, { emitEvent: false, onlySelf: true });
  }
}
