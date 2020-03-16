import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AccountService, Account, Advertiser, AdvertiserService, CampaignStoreService } from '../../core';
import { Campaign } from '../store/models';
import { selectLocalCampaign } from '../store/selectors';
import { CampaignFormUpdate, CampaignSetAdvertiser } from '../store/actions';
import { CampaignActionService } from '../store/actions/campaign-action.service';

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
    this.store.dispatch(new CampaignFormUpdate({ campaign, changed, valid }));
  }

  onAddAdvertiser(name: string) {
    const post = this.advertiserService.addAdvertiser(name);

    post.subscribe(result => {
      this.store.dispatch(new CampaignSetAdvertiser({ set_advertiser_uri: result.set_advertiser_uri }));
      // TODO: how are we notifying in this app, material or the ol' toast?
      // this.toastr.success('Advertiser added');
    });
  }
}
