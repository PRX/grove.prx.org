import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { combineLatest, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { getVelocity } from '../store/models';

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
        <mat-select formControlName="velocity">
          <mat-option value="evenly">Deliver Evenly</mat-option>
          <mat-option *ngIf="dailyMinimum > 0" value="fastly">Deliver Fast</mat-option>
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
        Any competing <strong>capped</strong> or <strong>baked-in</strong> flights will be served first before remnant flights are even
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
export class GoalFormComponent implements OnInit, OnDestroy {
  goalForm: FormGroup;
  velocitySub: Subscription;
  goalMinSub: Subscription;

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
    this.velocitySub = this.goalForm.get('velocity').valueChanges.subscribe(velocity => this.setDailyMinimum(velocity));
    this.goalMinSub = combineLatest([this.goalForm.get('totalGoal').valueChanges, this.goalForm.get('dailyMinimum').valueChanges])
      .pipe(distinctUntilChanged())
      .subscribe(([goal, min]) => this.setVelocity(goal, min));
  }

  ngOnDestroy() {
    if (this.velocitySub) {
      this.velocitySub.unsubscribe();
    }
    if (this.goalMinSub) {
      this.goalMinSub.unsubscribe();
    }
  }

  setVelocity(totalGoal: number, dailyMinimum: number) {
    this.goalForm.get('velocity').setValue(getVelocity(totalGoal, dailyMinimum), { emitEvent: false });
  }

  setDailyMinimum(velocity: string) {
    if (velocity === 'fastly') {
      this.goalForm.get('dailyMinimum').setValue(this.totalGoal);
    } else if (velocity === 'evenly') {
      this.goalForm.get('dailyMinimum').setValue('');
    }
  }
}
