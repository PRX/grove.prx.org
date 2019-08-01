import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CampaignModel } from '../shared/model/campaign.model';
import { CampaignService } from './campaign.service';

@Component({
  template: `
  <prx-tabs [model]="campaign$ | async">
    <nav>
      <a routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" [routerLink]="base">Campaign Meta Data</a>
      <a routerLinkActive="active" [routerLink]="[base, 'flights']">Flight 1</a>
    </nav>
  </prx-tabs>
  `
})
export class CampaignComponent implements OnInit {
  id: number;
  base: string;
  campaign$: Observable<CampaignModel>;

  constructor(private route: ActivatedRoute,
              private campaignService: CampaignService) {}

    ngOnInit() {
      this.route.params.forEach(params => {
        this.id = +params.id;
        this.base = '/campaign/' + (this.id || 'new');
        this.campaign$ = this.id ?
          this.campaignService.findCampaignById(this.id) :
          of(new CampaignModel(null, null, false));
    });
  }

}
