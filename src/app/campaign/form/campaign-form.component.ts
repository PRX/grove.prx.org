import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Campaign, Account, Advertiser } from '../../core';

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
    this.campaignUpdate.emit({
      campaign,
      changed: this.campaignForm.dirty,
      valid: this.campaignForm.valid
    });
  }

  updateCampaignForm({ name, type, status, repName, notes, set_account_uri, set_advertiser_uri }: Campaign) {
    this.campaignForm.reset(
      {
        set_account_uri,
        name,
        type,
        status,
        repName,
        notes,
        set_advertiser_uri
      },
      { emitEvent: false }
    );
  }
}
