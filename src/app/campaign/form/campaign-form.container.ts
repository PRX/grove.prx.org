import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService, AdvertiserService, Account, Advertiser, CampaignStoreService, Campaign } from 'src/app/core';

@Component({
  selector: 'grove-campaign-form.container',
  template: `
    <grove-campaign-form
      [campaign]="campaignStoreService.localCampaign$ | async"
      [advertisers]="advertisers$ | async"
      [accounts]="accounts$ | async"
      (campaignUpdate)="campaignUpdateFromForm($event)"
    ></grove-campaign-form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormContainerComponent implements OnInit {
  campaignRemote$: Observable<Campaign>;
  advertisers$: Observable<Advertiser[]>;
  accounts$: Observable<Account[]>;

  constructor(
    public campaignStoreService: CampaignStoreService,
    private accountService: AccountService,
    private advertiserService: AdvertiserService
  ) {
    this.accounts$ = this.accountService.listAccounts();
    this.advertisers$ = this.advertiserService.listAdvertisers();
  }

  ngOnInit() {}

  campaignUpdateFromForm({ campaign, changed, valid }) {
    const state = this.campaignStoreService.campaign;
    this.campaignStoreService.campaign = { ...state, localCampaign: campaign, changed, valid };
  }
}
