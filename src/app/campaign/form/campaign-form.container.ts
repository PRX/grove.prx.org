import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService, Account, Advertiser, CampaignStoreService, Campaign } from '../../core';

@Component({
  selector: 'grove-campaign-form.container',
  template: `
    <grove-campaign-form
      [campaign]="campaignStoreService.localCampaign$ | async"
      [accounts]="accounts$ | async"
      (campaignUpdate)="campaignUpdateFromForm($event)"
    ></grove-campaign-form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormContainerComponent implements OnInit {
  campaignRemote$: Observable<Campaign>;
  accounts$: Observable<Account[]>;

  constructor(
    public campaignStoreService: CampaignStoreService,
    private accountService: AccountService
  ) {
    this.accounts$ = this.accountService.listAccounts();
  }

  ngOnInit() {}

  campaignUpdateFromForm(newState: { campaign: Campaign; changed: boolean; valid: boolean }) {
    const { campaign, changed, valid } = newState;
    this.campaignStoreService.setCampaign({ localCampaign: campaign, changed, valid });
  }
}
