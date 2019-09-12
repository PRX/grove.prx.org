import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Account, Advertiser, Campaign } from '../../core';

@Component({
  selector: 'grove-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss']
})
export class CampaignFormComponent implements OnChanges, OnInit {
  @Input() accounts: Account[];
  @Input() advertisers: Advertiser[];
  @Input() campaign: Campaign;
  @Output() campaignChanged = new EventEmitter<boolean>(true);
  @Output() campaignValid = new EventEmitter<boolean>(true);
  @Output() campaignUpdate = new EventEmitter<Campaign>();

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
      this.formStatusChanged();
      this.campaignUpdate.emit(cmp);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.campaign && changes.campaign.currentValue) {
      this.updateCampaignForm(this.campaign);
    }
  }

  formStatusChanged() {
    this.campaignChanged.emit(this.campaignForm.dirty);
    this.campaignValid.emit(this.campaignForm.valid);
  }

  updateCampaignForm({ name, type, status, repName, notes, set_account_uri, set_advertiser_uri }: Campaign) {
    this.campaignForm.reset({
      set_account_uri,
      name,
      type,
      status,
      repName,
      notes,
      set_advertiser_uri
    });
    this.formStatusChanged();
  }
}
