import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CampaignModel } from '../shared/model/campaign.model';
import { CampaignService } from './service/campaign.service';

@Component({
  template: `
    <grove-campaign [id]="id" [campaign]="campaign$ | async">
    </grove-campaign>
  `
})
export class CampaignContainerComponent implements OnInit {
  id: number;
  campaign$: Observable<CampaignModel>;

  constructor(private route: ActivatedRoute,
              private campaignService: CampaignService) {}

  ngOnInit() {
    this.route.params.forEach(params => {
      this.id = +params.id;
      this.campaign$ = this.campaignService.findCampaignById(this.id);
    });
  }

}
