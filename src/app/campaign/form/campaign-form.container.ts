import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService, AdvertiserService, Account, Advertiser, Campaign, CampaignService } from '../../core';

@Component({
  selector: 'grove-campaign-form.container',
  template: `
    <grove-campaign-form
      [campaign]="campaignService.currentLocalCampaign$ | async"
      [advertisers]="advertisers$ | async"
      [accounts]="accounts$ | async"
      (campaignUpdate)="campaignUpdateFromForm($event)"
    ></grove-campaign-form>
  `
})
export class CampaignFormContainerComponent implements OnInit {
  campaignRemote$: Observable<Campaign>;
  advertisers$: Observable<Advertiser[]>;
  accounts$: Observable<Account[]>;

  constructor(
    protected campaignService: CampaignService,
    private accountService: AccountService,
    private advertiserService: AdvertiserService
  ) {
    this.accounts$ = this.accountService.listAccounts();
    this.advertisers$ = this.advertiserService.listAdvertisers();
  }

  ngOnInit() {}

  campaignUpdateFromForm({ campaign, changed, valid }) {
    this.campaignService.currentStateFirst$.subscribe(state => {
      this.campaignService.currentState$.next({ ...state, localCampaign: campaign, changed, valid });
    });
  }
}
