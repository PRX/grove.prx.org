import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Flight } from '../store/models';

@Component({
  selector: 'grove-goal-form',
  template: `
    <form class="goal-form" [formGroup]="goalForm" ngNativeValidate>
      <h2 class="title">Impressions</h2>
      <mat-slide-toggle formControlName="uncapped">No Cap</mat-slide-toggle>
      <mat-form-field appearance="outline" *ngIf="isCapped">
        <mat-label>Total Goal</mat-label>
        <input type="number" matInput placeholder="Total Goal" formControlName="totalGoal" required />
      </mat-form-field>
      <mat-form-field appearance="outline" *ngIf="isCapped">
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
    totalGoal: [0, Validators.required],
    dailyMinimum: [0],
    uncapped: [false]
  });
  goalFormSub: Subscription;

  get isCapped(): boolean {
    return !this.goalForm.get('uncapped').value;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.goalFormSub = this.goalForm.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged((a, b) => {
          return a.totalGoal === b.totalGoal && a.dailyMinimum === b.dailyMinimum && a.uncapped === b.uncapped;
        })
      )
      .subscribe(cmp => {
        if (cmp.uncapped) {
          this.formStatusChanged({ ...cmp, totalGoal: 0, dailyMinimum: 0 });
        } else {
          this.formStatusChanged(cmp);
        }
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
    const uncapped = formFields.uncapped || false;
    this.goalChange.emit({
      ...this.flight,
      id: formFields.id,
      totalGoal,
      dailyMinimum,
      uncapped
    });
  }

  updateGoalForm({ id, totalGoal, dailyMinimum, uncapped }: Flight) {
    this.goalForm.reset({ id, totalGoal, dailyMinimum, uncapped }, { emitEvent: false, onlySelf: true });
  }
}
