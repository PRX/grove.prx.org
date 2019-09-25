import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService, Account, Advertiser, AdvertiserService, CampaignStoreService, Campaign } from '../../core';
import { withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'grove-campaign-form.container',
  template: `
    <grove-campaign-form
      [campaign]="campaign$ | async"
      [accounts]="accounts$ | async"
      [advertisers]="advertisers$ | async"
      (campaignUpdate)="campaignUpdateFromForm($event)"
      (addAdvertiser)="onAddAdvertiser($event)"
    ></grove-campaign-form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormContainerComponent implements OnInit {
  campaign$: Observable<Campaign> = this.campaignStoreService.localCampaign$;
  accounts$: Observable<Account[]>;
  advertisers$: Observable<Advertiser[]> = this.advertiserService.advertisers;

  constructor(
    public campaignStoreService: CampaignStoreService,
    private accountService: AccountService,
    private advertiserService: AdvertiserService
  ) {
    this.accounts$ = this.accountService.listAccounts();
  }

  ngOnInit() {}

  campaignUpdateFromForm(newState: { campaign: Campaign; changed: boolean; valid: boolean }) {
    const { campaign, changed, valid } = newState;
    this.campaignStoreService.setCampaign({ localCampaign: campaign, changed, valid });
  }

  onAddAdvertiser(name: string) {
    const post = this.advertiserService.addAdvertiser(name);

    post.pipe(withLatestFrom(this.campaign$)).subscribe(([result, campaign]) => {
      // TODO: how are we notifying in this app, material or the ol' toast?
      // this.toastr.success('Advertiser added');
      this.campaignStoreService.setCampaign({
        localCampaign: {...campaign, set_advertiser_uri: result.set_advertiser_uri},
        changed: true,
        valid: true
      });
    });
  }
}
