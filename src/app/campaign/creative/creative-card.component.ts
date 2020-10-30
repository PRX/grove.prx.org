import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { FormGroup, ControlContainer } from '@angular/forms';
import { Creative } from '../store/models';

@Component({
  selector: 'grove-creative-card',
  template: `
    <div [formGroup]="creativeForm" class="form">
      <h3>
        {{ creative?.id ? 'Creative' : 'Silent File' }}
        <mat-slide-toggle formControlName="enabled" aria-label="disable"></mat-slide-toggle>
      </h3>
      <a *ngIf="creative?.id" class="creative" [routerLink]="creativeLink + creative.id" [class.disabled]="isDisabled()">
        {{ creative?.filename || creative?.url }}
      </a>
      <mat-form-field appearance="outline" class="weight">
        <mat-label>Weight</mat-label>
        <input type="number" required min="1" matInput formControlName="weight" />
        <span class="suffix" matSuffix>%</span>
      </mat-form-field>
    </div>
    <div *ngIf="canRemove()" class="remove">
      <button mat-button color="warn" (click)="onRemoveCreative()"><mat-icon>close</mat-icon> Remove</button>
    </div>
  `,
  styleUrls: ['./creative-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativeCardComponent implements OnInit {
  @Input() creative: Creative;
  @Input() creativeLink: string;
  @Output() remove = new EventEmitter();
  creativeForm: FormGroup;

  ngOnInit() {
    this.creativeForm = this.formContainer.control as FormGroup;
  }

  constructor(private formContainer: ControlContainer) {}

  isDisabled() {
    return !this.creativeForm.get('enabled').value;
  }

  canRemove() {
    // TODO: check if creative-flight-zone actuals > 0
    return true;
  }

  onRemoveCreative() {
    this.remove.emit();
  }
}
