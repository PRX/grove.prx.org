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
      <mat-form-field appearance="outline">
        <mat-label>Advertiser</mat-label>
        <input matInput type="text" formControlName="set_advertiser_uri" [matAutocomplete]="advertiser" />
        <mat-autocomplete #advertiser="matAutocomplete" [displayWith]="advertiserName.bind(this)">
          <mat-option *ngFor="let adv of advertisers" [value]="adv.set_advertiser_uri">{{ adv.name }}</mat-option>
        </mat-autocomplete>
      </mat-form-field>
      <grove-flight-zone-pingbacks [campaignId]="campaignId" [flightId]="flightId" [creative]="creative?.url"></grove-flight-zone-pingbacks>
      <div class="form-submit">
        <button mat-button (click)="save.emit(creative)" [disabled]="creativeForm.invalid">Save</button>
        <button mat-button color="primary" (click)="cancel.emit()">Cancel</button>
      </div>
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
  @Output() formUpdate = new EventEmitter<{ creative: Creative; changed: boolean; valid: boolean }>();
  @Output() save = new EventEmitter<Creative>();
  @Output() cancel = new EventEmitter();
  formSubcription: Subscription;
  urlSubscription: Subscription;

  creativeForm = this.fb.group({
    id: [],
    url: ['', Validators.required],
    filename: ['', Validators.required],
    set_account_uri: ['', Validators.required],
    set_advertiser_uri: ['', [Validators.required, this.validateAdvertiser.bind(this)]],
    pingbacks: [[], this.validatePingbacks.bind(this)]
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

  onFormValueChanges(creative: Creative) {
    this.formUpdate.emit({ creative, changed: this.creativeForm.dirty, valid: this.creativeForm.valid });
  }

  validatePingbacks({ value }: { value: string[] }): { [key: string]: any } | null {
    if (value && value.some(pingback => !pingback)) {
      return { error: 'Invalid pingbacks' };
    }
    return null;
  }

  validateAdvertiser({ value }: AbstractControl) {
    // valid: advertiser exists in advertiser list
    if (value && this.advertisers && !!this.advertisers.find(advertiser => advertiser.set_advertiser_uri === value)) {
      return null;
    }
    return { advertiserInvalid: true };
  }

  advertiserName(value?: string): string {
    if (value && this.advertisers) {
      const advertiser = this.advertisers.find(adv => adv.set_advertiser_uri === value);
      return advertiser && advertiser.name;
    }
  }
}
