import { Component, OnInit } from '@angular/core';
import { CampaignFormService } from './campaign-form.service';
import { Observable } from 'rxjs';
import { AccountService, AdvertiserService, Account, Advertiser, Campaign } from '../../core';

@Component({
  selector: 'grove-campaign-form.container',
  template: `
    <grove-campaign-form
      [campaign]="campaignRemote$ | async"
      [advertisers]="advertisers$ | async"
      [accounts]="accounts$ | async"
      (campaignChanged)="campaignChanged($event)"
      (campaignValid)="campaignValid($event)"
      (campaignUpdate)="campaignUpdateFromForm($event)"
    ></grove-campaign-form>
  `
})
export class CampaignFormContainerComponent implements OnInit {
  campaignRemote$: Observable<Campaign>;
  advertisers$: Observable<Advertiser[]>;
  accounts$: Observable<Account[]>;

  constructor(private dataSvc: CampaignFormService, private accountService: AccountService, private advertiserService: AdvertiserService) {
    this.campaignRemote$ = this.dataSvc.campaignRemote$;
    this.accounts$ = this.accountService.listAccounts();
    this.advertisers$ = this.advertiserService.listAdvertisers();
  }

  ngOnInit() {}

  campaignChanged(changed: boolean) {
    this.dataSvc.campaignChanged = changed;
  }

  campaignValid(valid: boolean) {
    this.dataSvc.campaignValid = valid;
  }

  campaignUpdateFromForm(updated: Campaign) {
    const campaign = this.dataSvc.campaignLocal$.getValue();
    this.dataSvc.campaignLocal$.next({ ...campaign, ...updated });
  }
}
