import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ControlContainer } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Creative } from '../store/models';

@Component({
  selector: 'grove-creative-card',
  template: `
    <div [formGroup]="creativeForm">
      <h3>
        {{ creative?.id ? 'Creative' : 'Silent File' }}
        <!-- <mat-slide-toggle formControlName="enabled" aria-label="disable"></mat-slide-toggle> -->
      </h3>
      <a *ngIf="creativeLink" class="creative" [routerLink]="creativeLink">{{ creative?.filename || creative?.url }}</a>
      <mat-form-field appearance="outline">
        <mat-label>Weight</mat-label>
        <input type="number" required min="1" matInput formControlName="weight" />
      </mat-form-field>
    </div>
  `,
  styleUrls: ['./creative-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativeCardComponent implements OnInit, OnDestroy {
  @Input() creative: Creative;
  @Input() creativeLink: string;
  creativeForm: FormGroup;
  disableChangedSubscription: Subscription;

  ngOnInit() {
    this.creativeForm = this.formContainer.control as FormGroup;
    this.disableChangedSubscription = this.creativeForm.get('enabled').valueChanges.subscribe(enabled => this.setDisabledState(!enabled));
  }

  ngOnDestroy() {
    if (this.disableChangedSubscription) {
      this.disableChangedSubscription.unsubscribe();
    }
  }

  constructor(private formContainer: ControlContainer) {}

  setDisabledState(isDisabled: boolean) {
    isDisabled
      ? this.creativeForm.get('weight').disable({ emitEvent: false })
      : this.creativeForm.get('weight').enable({ emitEvent: false });
  }
}
