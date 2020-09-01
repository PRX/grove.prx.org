import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ControlContainer } from '@angular/forms';
import { Creative } from '../store/models';

@Component({
  selector: 'grove-creative-card',
  template: `
    <div [formGroup]="creativeForm">
      <h3>
        {{ creative?.id ? 'Creative' : 'Silent File' }}
        <mat-slide-toggle formControlName="enabled" aria-label="disable"></mat-slide-toggle>
      </h3>
      <a *ngIf="creativeLink" class="creative" [routerLink]="creativeLink">{{ creative.filename || creative.url }}</a>
      <mat-form-field appearance="outline">
        <mat-label>Weight</mat-label>
        <input type="number" required min="1" matInput formControlName="weight" />
      </mat-form-field>
    </div>
  `,
  styleUrls: ['./creative-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativeCardComponent implements OnInit {
  @Input() creative: Creative;
  @Input() creativeLink: string;
  creativeForm: FormGroup;

  ngOnInit() {
    this.creativeForm = this.formContainer.control as FormGroup;
  }

  constructor(private formContainer: ControlContainer) {}
}
