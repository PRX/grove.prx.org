import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { Account, Advertiser } from '../store/models';
import { Campaign } from '../store/models';
import { selectLocalCampaign, selectAllAccounts, selectAllAdvertisers } from '../store/selectors';
import * as campaignActions from '../store/actions/campaign-action.creator';
import * as advertiserActions from '../store/actions/advertiser-action.creator';

@Component({
  selector: 'grove-campaign-form.container',
  template: `
    <grove-campaign-form
      *ngIf="{ campaigns: campaign$ | async, accounts: accounts$ | async, advertisers: advertisers$ | async } as data"
      [campaign]="data.campaigns"
      [accounts]="data.accounts"
      [advertisers]="data.advertisers"
      (campaignUpdate)="campaignUpdateFromForm($event)"
      (addAdvertiser)="onAddAdvertiser($event)"
    ></grove-campaign-form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFormContainerComponent implements OnInit {
  accounts$: Observable<Account[]>;
  advertisers$: Observable<Advertiser[]>;
  campaign$: Observable<Campaign>;

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.accounts$ = this.store.pipe(select(selectAllAccounts));
    this.advertisers$ = this.store.pipe(select(selectAllAdvertisers));
    this.campaign$ = this.store.pipe(select(selectLocalCampaign));
  }

  campaignUpdateFromForm({ campaign, changed, valid }: { campaign: Campaign; changed: boolean; valid: boolean }) {
    this.store.dispatch(new campaignActions.CampaignFormUpdate({ campaign, changed, valid }));
  }

  onAddAdvertiser(name: string) {
    this.store.dispatch(new advertiserActions.AddAdvertiser({ name }));
  }
}
