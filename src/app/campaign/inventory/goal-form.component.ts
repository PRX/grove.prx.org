import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';

@Component({
  selector: 'grove-goal-form',
  template: `
    <div class="goal-form" [formGroup]="goalForm" ngNativeValidate>
      <h2 class="title">Impressions</h2>

      <mat-form-field appearance="outline">
        <mat-label>Flight Type</mat-label>
        <mat-select formControlName="deliveryMode" required>
          <mat-option *ngFor="let opt of deliveryModeOptions" [value]="opt.value">{{ opt.name }}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" *ngIf="!isBaked">
        <mat-label>Total Goal</mat-label>
        <input type="number" matInput placeholder="Total Goal" formControlName="totalGoal" />
      </mat-form-field>

      <mat-form-field appearance="outline" *ngIf="!isBaked">
        <mat-label>Contract Goal</mat-label>
        <input type="number" matInput placeholder="Contract Goal" formControlName="contractGoal" />
      </mat-form-field>

      <mat-form-field appearance="outline" *ngIf="isCapped">
        <mat-label>Daily Minimum</mat-label>
        <input type="number" matInput placeholder="Daily Minimum" formControlName="dailyMinimum" />
      </mat-form-field>

      <mat-form-field appearance="outline" *ngIf="isCapped">
        <mat-label>Velocity</mat-label>
        <mat-select [value]="getVelocity()" (selectionChange)="setVelocity($event.value)">
          <mat-option value="evenly">Deliver Evenly</mat-option>
          <mat-option value="fastly">Deliver Fast</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div *ngIf="isRemnant">
      <p>
        <strong>Backup / Remnant Flights</strong> will serve in equal proportions with other competing remnant flights during their date
        range. You can either set a total goal after which the flight will stop, or leave blank to serve an unlimited amount.
      </p>
      <br />
      <p>
        Any competing <strong>capped</strong> or <strong>baked-in</strong> flights will be served first before uncapped flights are even
        considered. The allocations that will be served before this flight can be seen below <b class="warn">in red</b>.
      </p>
    </div>

    <div *ngIf="isBaked">
      <p>
        <strong>Simulated Baked-In Flights</strong> will serve exclusively and in unlimited amounts on their days, taking all allocations
        away from other flights.
      </p>
      <br />
    </div>
  `,
  styleUrls: ['goal-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalFormComponent implements OnInit {
  goalForm: FormGroup;

  readonly deliveryModeOptions = [
    { name: 'Capped', value: 'capped' },
    { name: 'Backup / Remnant', value: 'uncapped' },
    { name: 'Simulate Baked-in', value: 'greedy_uncapped' }
  ];

  get deliveryMode(): string {
    return this.goalForm.get('deliveryMode').value;
  }

  get totalGoal(): number {
    return this.goalForm.get('totalGoal').value;
  }

  get dailyMinimum(): number {
    return this.goalForm.get('dailyMinimum').value;
  }

  get isCapped(): boolean {
    return this.deliveryMode === 'capped';
  }

  get isRemnant(): boolean {
    return this.deliveryMode === 'uncapped';
  }

  get isBaked(): boolean {
    return this.deliveryMode === 'greedy_uncapped';
  }

  constructor(private formController: ControlContainer) {}

  ngOnInit() {
    this.goalForm = this.formController.control as FormGroup;
  }

  getVelocity(): string {
    const min = this.dailyMinimum;
    const goal = this.totalGoal;
    if (min && min >= goal) {
      return 'fastly';
    } else if (min) {
      return '';
    } else {
      return 'evenly';
    }
  }

  setVelocity(val: string) {
    if (val === 'fastly') {
      this.goalForm.get('dailyMinimum').setValue(this.totalGoal);
    } else if (val === 'evenly') {
      this.goalForm.get('dailyMinimum').setValue('');
    }
  }
}
