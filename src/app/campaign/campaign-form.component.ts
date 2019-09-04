import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder } from '@angular/forms';
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
    accountId: [''],
    name: [''],
    type: [''],
    status: [''],
    repName: [''],
    notes: [''],
    set_advertiser_uri: ['']
  });

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private auguryService: AuguryService) { }

  ngOnInit() {
    this.accountOptions$ = this.userService.accounts.pipe(
      withLatestFrom(this.userService.defaultAccount),
      map(([accounts, defaultAccount]) => {
        const defaultAccountOption = {name: defaultAccount['name'], value: defaultAccount.id};
        return [defaultAccountOption].concat(accounts.map(doc => ({name: doc['name'], value: doc.id})));
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
