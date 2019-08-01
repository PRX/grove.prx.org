import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CampaignModel } from '../shared/model/campaign.model';
import { CampaignService } from './campaign.service';

@Component({
  selector: 'app-campaign-list',
  template: `
    <ul>
      <li *ngFor="let campaign of campaigns$ | async">{{ campaign.name }}</li>
    </ul>
  `
})
export class CampaignListComponent implements OnInit {
  campaigns$: Observable<CampaignModel[]>;

  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    this.campaigns$ = this.campaignService.campaigns;
  }

}
