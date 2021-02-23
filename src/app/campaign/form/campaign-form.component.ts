import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { Account, Advertiser } from '../store/models';
import { Campaign } from '../store/models';

@Component({
  selector: 'grove-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormComponent implements OnInit {
  @Input() accounts: Account[];
  @Input() advertisers: Advertiser[];
  @Output() campaignUpdate = new EventEmitter<{ campaign: Campaign; changed: boolean; valid: boolean }>(true);
  @Output() addAdvertiser = new EventEmitter<string>();

  // tslint:disable-next-line
  private _campaign: Campaign;
  get campaign(): Campaign {
    return this._campaign;
  }

  @Input()
  set campaign(campaign: Campaign) {
    if (campaign) {
      this._campaign = campaign;
      this.updateCampaignForm(this._campaign);
    }
  }

  readonly typeOptions = [
    { name: 'Paid', value: 'paid' },
    { name: 'House', value: 'house' }
  ];

  campaignForm = this.fb.group({
    set_account_uri: ['', Validators.required],
    name: ['', Validators.required],
    type: ['', Validators.required],
    repName: ['', Validators.required],
    salesRepName: [''],
    notes: [''],
    set_advertiser_uri: ['', [Validators.required, this.validateAdvertiser.bind(this)]]
  });

  get set_account_uri() {
    return this.campaignForm.get('set_account_uri');
  }
  get name() {
    return this.campaignForm.get('name');
  }
  get type() {
    return this.campaignForm.get('type');
  }
  get repName() {
    return this.campaignForm.get('repName');
  }
  get notes() {
    return this.campaignForm.get('notes');
  }
  get set_advertiser_uri() {
    return this.campaignForm.get('set_advertiser_uri');
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.campaignForm.valueChanges.subscribe(cmp => {
      this.formStatusChanged(cmp);
    });
  }

  formStatusChanged(campaign?: Campaign) {
    // when user types an advertiser name match into the advertiser autoselect, set advertiser by value (URI)
    if (campaign.set_advertiser_uri) {
      const findAdvertiserByName = this.advertisers && this.advertisers.find(adv => adv.name === campaign.set_advertiser_uri);
      if (findAdvertiserByName) {
        campaign = { ...campaign, set_advertiser_uri: findAdvertiserByName.set_advertiser_uri };
      }
    }
    this.campaignUpdate.emit({
      campaign,
      changed: this.campaignForm.dirty,
      valid: this.campaignForm.valid
    });
  }

  updateCampaignForm(campaign: Campaign) {
    const { name, type, repName, salesRepName, notes, set_account_uri, set_advertiser_uri } = campaign;

    // set_advertiser_uri might be a typeahead advertiser name instead
    // NOTE: this fails if someone types a url as the advertiser name
    const isAdvertiserName = set_advertiser_uri && !set_advertiser_uri.match(/^http(s)?:.+\/api\/v1\//);

    // only set fields that are present, but allow fields to be explicitly set to null or empty string (new campaign)
    this.campaignForm.patchValue(
      {
        ...(campaign.hasOwnProperty('name') && { name }),
        ...(campaign.hasOwnProperty('type') && { type }),
        ...(campaign.hasOwnProperty('repName') && { repName }),
        ...(campaign.hasOwnProperty('salesRepName') && { salesRepName }),
        ...(campaign.hasOwnProperty('notes') && { notes }),
        ...(campaign.hasOwnProperty('set_account_uri') && { set_account_uri }),
        ...(!isAdvertiserName && { set_advertiser_uri })
      },
      { emitEvent: false, onlySelf: true }
    );
  }

  onAddAdvertiser(name: string) {
    this.addAdvertiser.emit(name);
  }

  validateAdvertiser({ value }: AbstractControl) {
    // valid: advertiser exists in advertiser list
    if (value && this.advertisers && !!this.advertisers.find(advertiser => advertiser.set_advertiser_uri === value)) {
      return null;
    }
    return { advertiserInvalid: true };
  }
}
