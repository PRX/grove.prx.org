import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { Creative, Account, Advertiser } from '../store/models';

@Component({
  selector: 'grove-creative-form',
  template: `
    <form [formGroup]="creativeForm">
      <mat-form-field class="campaign-form-field" appearance="outline">
        <mat-label>Creative File URL</mat-label>
        <input matInput placeholder="Creative File URL" formControlName="url" autocomplete="off" required />
        <mat-error *ngIf="checkInvalidUrl('invalidUrl')">Invalid URL</mat-error>
        <mat-error *ngIf="checkInvalidUrl('notMp3')">Must end in mp3</mat-error>
        <mat-error *ngIf="checkInvalidUrl('error') as error">{{ error }}</mat-error>
      </mat-form-field>
      <mat-form-field class="campaign-form-field" appearance="outline">
        <mat-label>Filename</mat-label>
        <input matInput placeholder="Creative File Label" formControlName="filename" required />
      </mat-form-field>
      <mat-form-field class="campaign-form-field" appearance="outline" *ngIf="accounts">
        <mat-label>Owner</mat-label>
        <mat-select formControlName="set_account_uri" required>
          <mat-option *ngFor="let acct of accounts" [value]="acct.self_uri">{{ acct.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline" *ngIf="advertisers">
        <mat-label>Advertiser</mat-label>
        <input matInput type="text" formControlName="set_advertiser_uri" [matAutocomplete]="advertiser" />
        <mat-autocomplete #advertiser="matAutocomplete" [displayWith]="advertiserName.bind(this)">
          <mat-option *ngFor="let adv of filteredAdvertisers$ | async" [value]="adv.set_advertiser_uri">{{ adv.name }}</mat-option>
        </mat-autocomplete>
      </mat-form-field>
      <grove-creative-pingbacks
        formControlName="pingbacks"
        [campaignId]="campaignId"
        [flightId]="flightId"
        [creative]="creative?.url"
      ></grove-creative-pingbacks>
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
  filteredAdvertisers$: Observable<Advertiser[]>;
  formSubcription: Subscription;
  urlSubscription: Subscription;

  creativeForm = this.fb.group({
    id: [],
    url: ['', [Validators.required, this.validateMp3.bind(this)]],
    filename: ['', Validators.required],
    set_account_uri: ['', Validators.required],
    set_advertiser_uri: ['', [Validators.required, this.validateAdvertiser.bind(this)]],
    pingbacks: [[]]
  });

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.formSubcription = this.creativeForm.valueChanges.subscribe(flightFormModel => {
      this.onFormValueChanges(flightFormModel);
    });
    this.urlSubscription = this.creativeForm.get('url').valueChanges.subscribe(url => {
      const creativeControl = this.creativeForm.get('filename');
      // if the creative has not yet been created and filename has no value or is untouched, fill it with url
      if (this.creative && !this.creative.createdAt && (!creativeControl.value || creativeControl.untouched)) {
        creativeControl.setValue(url, { emitEvent: false });
      }
    });
    this.filteredAdvertisers$ = this.creativeForm.get('set_advertiser_uri').valueChanges.pipe(
      // startWith empty value to populate filtered options
      startWith(''),
      map(value => {
        if (this.advertisers) {
          // if no value or valueChange matches one of the existing options, list is unfiltered
          if (!value || this.advertisers.find(adv => adv.set_advertiser_uri === value)) {
            return this.advertisers;
          } else {
            return this.advertisers.filter(adv => {
              // partial match: advertiser name starts with value
              return adv.name.toLowerCase().indexOf(value.toLowerCase()) === 0;
            });
          }
        }
      })
    );
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
    this.creativeForm.patchValue(creative, { emitEvent: false });
  }

  onFormValueChanges(creative: Creative) {
    this.formUpdate.emit({ creative, changed: this.creativeForm.dirty, valid: this.creativeForm.valid });
  }

  validateMp3({ value }: AbstractControl): { [key: string]: any } | null {
    if (value) {
      try {
        // try parsing as URL, throws Error if invalid
        const url = new URL(value);
        // if (!url.protocol.match(/^http(s)?:\/\//)) {
        if (!url.protocol.match(/^http(s)?:/)) {
          return { invalidUrl: { value } };
        } else if (!url.pathname.endsWith('.mp3')) {
          return { notMp3: { value } };
        }
      } catch (error) {
        return { error };
      }
    }
    return null;
  }

  checkInvalidUrl(type: string) {
    return this.creativeForm.get('url').getError(type);
  }

  validateAdvertiser({ value }: AbstractControl): { [key: string]: any } | null {
    // valid: advertiser exists in advertiser list
    if (value && this.advertisers && !!this.advertisers.find(advertiser => advertiser.set_advertiser_uri === value)) {
      return null;
    }
    return { advertiserInvalid: true };
  }

  advertiserName(value?: string): string {
    if (value && this.advertisers) {
      // wat? should this be adv.name === value???
      const advertiser = this.advertisers.find(adv => adv.name === value || adv.set_advertiser_uri === value);
      return (advertiser && advertiser.name) || value;
    }
  }
}
