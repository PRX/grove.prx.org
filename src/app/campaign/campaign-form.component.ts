import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../core/user/user.service';
import { AuguryService } from '../core/augury.service';
import { withLatestFrom, map } from 'rxjs/operators';

@Component({
  selector: 'grove-campaign',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss']
})

export class CampaignFormComponent implements OnInit {
  advertiserOptions$: Observable<{name: string, value: string}[]>;
  accountOptions$: Observable<{name: string, value: number}[]>;
  readonly typeOptions = [
    {name: 'Paid Campaign', value: 'paid_campaign'},
    {name: 'Cross Promo', value: 'cross_promo'},
    {name: 'Cross Promo Special', value: 'cross_promo_special'},
    {name: 'Event', value: 'event'},
    {name: 'Fundraiser', value: 'fundraiser'},
    {name: 'House', value: 'house'},
    {name: 'Survey', value: 'survey'}
  ];

  readonly statusOptions = [
    {name: 'Draft', value: 'draft'},
    {name: 'Hold', value: 'hold'},
    {name: 'Sold', value: 'sold'},
    {name: 'Approved', value: 'approved'},
    {name: 'Paused', value: 'paused'},
    {name: 'Canceled', value: 'canceled'}
  ];

  campaignForm = this.fb.group({
    accountId: ['', Validators.required],
    name: ['', Validators.required],
    type: ['', Validators.required],
    status: ['', Validators.required],
    repName: ['', Validators.required],
    notes: [''],
    set_advertiser_uri: ['', Validators.required]
  });
  get accountId() { return this.campaignForm.get('accountId'); }
  get name() { return this.campaignForm.get('name'); }
  get type() { return this.campaignForm.get('type'); }
  get status() { return this.campaignForm.get('status'); }
  get repName() { return this.campaignForm.get('repName'); }
  get notes() { return this.campaignForm.get('notes'); }
  get set_advertiser_uri() { return this.campaignForm.get('set_advertiser_uri'); }

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private auguryService: AuguryService) { }

  ngOnInit() {
    this.advertiserOptions$ = this.fetchAdvertisers();

    this.accountOptions$ = this.userService.accounts.pipe(
      withLatestFrom(this.userService.defaultAccount),
      map(([accounts, defaultAccount]) => {
        const defaultAccountOption = {name: defaultAccount['name'], value: defaultAccount.id};
        return [defaultAccountOption].concat(accounts.map(doc => ({name: doc['name'], value: doc.id})));
      })
    );

  }

  fetchAdvertisers() {
    const resourceName = 'advertisers';
    return this.auguryService.followItems(`prx:${resourceName}`).pipe(
      map((advertisers) => {
        return advertisers.map(adv => ({
          name: adv['name'], value: [this.auguryService.path, resourceName, adv['id']].join('/')
        }));
      })
    );
  }

  campaignFormSubmit() {
    this.auguryService.root.subscribe(rootDoc => {
      console.log(rootDoc);
      const resp = rootDoc.create('prx:campaign', {}, this.campaignForm.value);
      resp.subscribe(res => console.log(res));
    });
  }
}
