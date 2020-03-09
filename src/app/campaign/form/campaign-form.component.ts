import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Account, Advertiser } from '../../core';
import { Campaign } from '../store/reducers';

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
    { name: 'Paid Campaign', value: 'paid_campaign' },
    { name: 'Cross Promo', value: 'cross_promo' },
    { name: 'Cross Promo Special', value: 'cross_promo_special' },
    { name: 'Event', value: 'event' },
    { name: 'Fundraiser', value: 'fundraiser' },
    { name: 'House', value: 'house' },
    { name: 'Survey', value: 'survey' }
  ];

  readonly statusOptions = [
    { name: 'Draft', value: 'draft' },
    { name: 'Hold', value: 'hold' },
    { name: 'Sold', value: 'sold' },
    { name: 'Approved', value: 'approved' },
    { name: 'Paused', value: 'paused' },
    { name: 'Canceled', value: 'canceled' }
  ];

  campaignForm = this.fb.group({
    set_account_uri: ['', Validators.required],
    name: ['', Validators.required],
    type: ['', Validators.required],
    status: ['', Validators.required],
    repName: ['', Validators.required],
    notes: [''],
    set_advertiser_uri: ['', Validators.required]
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
  get status() {
    return this.campaignForm.get('status');
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
    const { name, type, status, repName, notes, set_account_uri, set_advertiser_uri } = campaign;
    const findAdvertiserByURI =
      set_advertiser_uri && this.advertisers && this.advertisers.find(adv => adv.set_advertiser_uri === set_advertiser_uri);
    // only set fields that are present, but allow fields to be explicitly set to null or empty string (new campaign)
    this.campaignForm.patchValue(
      {
        ...(campaign.hasOwnProperty('name') && { name }),
        ...(campaign.hasOwnProperty('type') && { type }),
        ...(campaign.hasOwnProperty('status') && { status }),
        ...(campaign.hasOwnProperty('repName') && { repName }),
        ...(campaign.hasOwnProperty('notes') && { notes }),
        ...(campaign.hasOwnProperty('set_account_uri') && { set_account_uri }),
        ...((findAdvertiserByURI && { set_advertiser_uri: findAdvertiserByURI.set_advertiser_uri }) ||
          (campaign.hasOwnProperty('set_advertiser_uri') && !set_advertiser_uri && { set_advertiser_uri }))
      },
      { emitEvent: false, onlySelf: true }
    );
  }

  onAddAdvertiser(name: string) {
    this.addAdvertiser.emit(name);
  }
}
