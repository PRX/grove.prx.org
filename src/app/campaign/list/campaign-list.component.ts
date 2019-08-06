import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CampaignModel } from '../../shared/model/campaign.model';
import { CampaignService } from '../service/campaign.service';

@Component({
  selector: 'grove-campaign-list',
  template: `
    <ul>
      <li *ngFor="let campaign of campaigns$ | async">{{ campaign.name }}</li>
    </ul>
    <grove-campaign-list-paging
      [currentPage]="currentPage"
      [totalPages]="totalPages"
      (showPage)="showPage($event)">
    </grove-campaign-list-paging>
  `
})
export class CampaignListComponent implements OnInit {
  campaigns$: Observable<CampaignModel[]>;

  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    this.campaigns$ = this.campaignService.campaigns;
  }

  get currentPage(): number {
    return this.campaignService.page;
  }

  get totalPages(): number {
    const plusOne = this.campaignService.total === 0 || this.campaignService.total % this.campaignService.per > 0 ? 1 : 0;
    return Math.floor(this.campaignService.total / this.campaignService.per) + plusOne;
  }

  showPage(page: number) {
    this.campaignService.loadCampaigns({page});
  }

}
