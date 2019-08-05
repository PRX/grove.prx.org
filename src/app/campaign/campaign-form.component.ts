import { Component, OnInit } from '@angular/core';
import { TabService } from 'ngx-prx-styleguide';
import { CampaignModel } from '../shared/model/campaign.model';
@Component({
  template: `
    <form *ngIf="campaign">
      <prx-fancy-field textinput [model]="campaign" name="name" label="Campaign Name" required>
      </prx-fancy-field>

      <prx-fancy-field [model]="campaign" name="type" [select]="typeOptions"  small="1" required>
      </prx-fancy-field>

      <prx-fancy-field [model]="campaign" name="status" [select]="statusOptions"  small="1" required>
      </prx-fancy-field>

      <prx-fancy-field textinput [model]="campaign" name="repName" label="Campaign Representative" required>
      </prx-fancy-field>

    </form>
  `
})
export class CampaignFormComponent implements OnInit {
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
    ['draft'],
    ['hold'],
    ['sold'],
    ['approved'],
    ['paused'],
    ['canceled']
  ];

  constructor(private tab: TabService) {}

  ngOnInit() {
    this.tab.model.subscribe(campaign => this.campaign = campaign as CampaignModel);
  }
}
