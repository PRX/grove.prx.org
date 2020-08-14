import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Creative, Account, Advertiser } from '../store/models';

@Component({
  selector: 'grove-creative-form',
  template: `
    <form [formGroup]="creativeForm">
      <mat-form-field class="campaign-form-field" appearance="outline">
        <mat-label>File</mat-label>
        <input matInput placeholder="Creative File URL" formControlName="url" required />
      </mat-form-field>
      <mat-form-field class="campaign-form-field" appearance="outline">
        <mat-label>Filename</mat-label>
        <input matInput placeholder="Creative File Label" formControlName="filename" required />
      </mat-form-field>
      <mat-form-field class="campaign-form-field" appearance="outline">
        <mat-label>Owner</mat-label>
        <mat-select formControlName="set_account_uri" required>
          <mat-option *ngFor="let acct of accounts" [value]="acct.self_uri">{{ acct.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <grove-autocomplete
        *ngIf="advertisers"
        class="campaign-form-field"
        [formGroup]="creativeForm"
        controlName="set_advertiser_uri"
        label="Advertiser"
        [options]="{ options: advertisers, name: 'name', value: 'set_advertiser_uri' } | optionsTransform"
        (addOption)="onAddAdvertiser($event)"
      >
      </grove-autocomplete>
      <grove-flight-zone-pingbacks [campaignId]="campaignId" [flightId]="flightId" [creative]="creative?.url"></grove-flight-zone-pingbacks>
    </form>
  `,
  styleUrls: ['./creative-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativeFormComponent implements OnInit, OnDestroy {
  @Input() accounts: Account[];
  @Input() advertisers: Advertiser[];
  @Input() campaignId: number;
  @Input() flightId: number;
  // tslint:disable-next-line: variable-name
  _creative: Creative;
  @Input()
  set creative(creative: Creative) {
    this._creative = creative;
    if (creative) {
      this.setCreativeFormValue(creative);
    }
  }
  get creative() {
    return this._creative;
  }
  formSubcription: Subscription;
  urlSubscription: Subscription;

  creativeForm = this.fb.group({
    id: [],
    url: ['', Validators.required],
    filename: ['', Validators.required],
    set_account_uri: ['', Validators.required],
    set_advertiser_uri: ['', [Validators.required, this.validateAdvertiser.bind(this)]],
    pingbacks: ['', Validators.required]
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formSubcription = this.creativeForm.valueChanges.subscribe(flightFormModel => {
      this.onFormValueChanges(flightFormModel);
    });
    this.urlSubscription = this.creativeForm.get('url').valueChanges.subscribe(url => {
      const creativeControl = this.creativeForm.get('filename');
      if (!creativeControl.value || creativeControl.untouched) {
        creativeControl.setValue(url, { emitEvent: false });
      }
    });
  }

  ngOnDestroy() {
    if (this.formSubcription) {
      this.formSubcription.unsubscribe();
    }
    if (this.urlSubscription) {
      this.urlSubscription.unsubscribe();
    }
  }

  setCreativeFormValue(creative: Creative) {
    this.creativeForm.setValue(creative, { emitEvent: false });
  }

  onFormValueChanges(creative: Creative) {}

  onAddAdvertiser(name: string) {
    // this.store.dispatch(advertiserActions.AddAdvertiser({ name }));
  }

  validateAdvertiser({ value }: AbstractControl) {
    // valid: advertiser exists in advertiser list
    if (value && this.advertisers && !!this.advertisers.find(advertiser => advertiser.set_advertiser_uri === value)) {
      return null;
    }
    return { advertiserInvalid: true };
  }
}
