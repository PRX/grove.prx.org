import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';

@Component({
  selector: 'grove-goal-form',
  template: `
    <div class="goal-form" [formGroup]="goalForm" ngNativeValidate>
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
      <mat-form-field appearance="outline">
        <mat-label>Contract Goal</mat-label>
        <input type="number" matInput placeholder="Contract Goal" formControlName="contractGoal" />
      </mat-form-field>
    </div>
    <div *ngIf="!isCapped">
      <p>
        <strong>Uncapped Flights</strong> will serve an unlimited amount during their date ranges, in equal proportions with other competing
        uncapped flights.
      </p>
      <br />
      <p>
        Any competing <strong>capped</strong> flights will be served first before uncapped flights are even considered. Capped flight
        allocations can be seen below <b class="warn">in red</b>.
      </p>
    </div>
  `,
  styleUrls: ['goal-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalFormComponent implements OnInit {
  goalForm: FormGroup;

  get isCapped(): boolean {
    return !this.goalForm.get('uncapped').value;
  }

  constructor(private formController: ControlContainer) {}

  ngOnInit() {
    this.goalForm = this.formController.control as FormGroup;
  }
}
