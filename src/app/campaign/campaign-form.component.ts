import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TabService } from 'ngx-prx-styleguide';
import { AdvertiserService } from './advertiser.service';
import { CampaignModel } from '../shared/model/campaign.model';
import { UserService } from '../core/user.service';
@Component({
  template: `
    <form *ngIf="campaign">
      <prx-fancy-field
        label="Owner"
        [model]="campaign" name="accountId" [select]="accountOptions$ | async" required>
      </prx-fancy-field>

      <prx-fancy-field
      label="Campaign Name"
        textinput [model]="campaign" name="name"  required>
      </prx-fancy-field>

      <prx-fancy-field
        label="Advertiser"
        [model]="campaign" name="advertiser" [select]="advertiserOptions$ | async" required>
      </prx-fancy-field>

      <prx-fancy-field
        label="Campaign Status"
        [model]="campaign" name="type" [select]="typeOptions" required>
      </prx-fancy-field>

      <prx-fancy-field
        label="Campaign Type"
        [model]="campaign" name="status" [select]="statusOptions" required>
      </prx-fancy-field>

      <prx-fancy-field
        label="Campaign Rep"
        textinput [model]="campaign" name="repName" required>
      </prx-fancy-field>

      <prx-fancy-field
        label="Campaign Notes"
        textarea [model]="campaign" name="notes" required>
      </prx-fancy-field>

    </form>
  `
})
export class CampaignFormComponent implements OnInit {
  advertiserOptions$: Observable<(string | number)[][]>;
  accountOptions$: Observable<string[][]>;
  campaign: CampaignModel;
  typeOptions = [
    ['Paid Campaign', 'paid_campaign'],
    ['Cross Promo', 'cross_promo'],
    ['Cross Promo Special', 'cross_promo_special'],
    ['Event', 'event'],
    ['Fundraiser', 'fundraiser'],
    ['House', 'house'],
    ['Survey', 'survey']
  ];
  statusOptions = [
    ['Draft', 'draft'],
    ['Hold', 'hold'],
    ['sold', 'sold'],
    ['Approved', 'approved'],
    ['Paused', 'paused'],
    ['Canceled', 'canceled']
  ];

  constructor(private tab: TabService,
              private advertiserService: AdvertiserService,
              private userService: UserService) {}

  ngOnInit() {
    this.tab.model.subscribe(campaign => this.campaign = campaign as CampaignModel);
    this.advertiserOptions$ = this.advertiserService.advertisers.pipe(
      map(advertisers =>
        advertisers.map(a => [a.name, a.id]))
    );
    this.accountOptions$ = this.userService.accounts.pipe(
      map(accounts => accounts.map(doc => [doc['name'], doc.id]))
    );
  }
}
