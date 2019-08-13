import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { TabService } from 'ngx-prx-styleguide';
import { AdvertiserService } from '../service/advertiser.service';
import { CampaignModel } from '../../shared/model/campaign.model';
import { UserService } from '../../core/user.service';

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
        [model]="campaign" name="advertiserId" [select]="advertiserOptions$ | async" required>
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
        textarea [model]="campaign" name="notes">
      </prx-fancy-field>

    </form>
  `
})
export class CampaignFormComponent implements OnInit {
  advertiserOptions$: Observable<(string | number)[][]>;
  accountOptions$: Observable<any[][]>;
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
    ['Sold', 'sold'],
    ['Approved', 'approved'],
    ['Paused', 'paused'],
    ['Canceled', 'canceled']
  ];

  constructor(private tab: TabService,
              private advertiserService: AdvertiserService,
              private userService: UserService) {}

  ngOnInit() {
    this.tab.model.subscribe(campaign => {
      this.campaign = campaign as CampaignModel;
    });
    this.advertiserOptions$ = this.advertiserService.advertisers.pipe(
      map(advertisers =>
        advertisers.map(a => [a.name, a.id]))
    );
    this.accountOptions$ = this.userService.accounts.pipe(
      withLatestFrom(this.userService.defaultAccount),
      map(([accounts, defaultAccount]) => {
        const defaultAccountOption = [defaultAccount['name'], defaultAccount.id];
        return [defaultAccountOption].concat(accounts.map(doc => [doc['name'], doc.id]));
      })
    );
  }
}
