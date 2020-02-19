import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AccountService, Account, Advertiser, AdvertiserService, CampaignStoreService, Campaign } from '../../core';
import { selectLocalCampaign } from '../store/selectors';
import { withLatestFrom } from 'rxjs/operators';
import { CampaignFormUpdate } from '../store/actions';

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
  campaign$: Observable<Campaign>;
  accounts$: Observable<Account[]> = this.accountService.accounts;
  advertisers$: Observable<Advertiser[]> = this.advertiserService.advertisers;

  constructor(
    public campaignStoreService: CampaignStoreService,
    public store: Store<any>,
    private accountService: AccountService,
    private advertiserService: AdvertiserService
  ) {}

  ngOnInit() {
    this.campaign$ = this.store.pipe(select(selectLocalCampaign));
  }

  campaignUpdateFromForm(newState: { campaign: Campaign; changed: boolean; valid: boolean }) {
    const { campaign, changed, valid } = newState;
    this.campaignStoreService.setCampaign({ localCampaign: campaign, changed, valid });
    this.store.dispatch(new CampaignFormUpdate({ campaign, changed, valid }));
  }

  onAddAdvertiser(name: string) {
    const post = this.advertiserService.addAdvertiser(name);

    post.pipe(withLatestFrom(this.campaign$)).subscribe(([result, campaign]) => {
      // TODO: how are we notifying in this app, material or the ol' toast?
      // this.toastr.success('Advertiser added');
      this.campaignStoreService.setCampaign({
        localCampaign: { ...campaign, set_advertiser_uri: result.set_advertiser_uri },
        changed: true,
        valid: true
      });
    });
  }
}
