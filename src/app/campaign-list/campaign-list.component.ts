import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Campaign, CampaignListService } from './campaign-list.service';

@Component({
  selector: 'grove-campaign-list',
  template: `
    <ul>
      <li *ngFor="let campaign of campaigns$ | async">
        <grove-campaign-card [campaign]="campaign"></grove-campaign-card>
      </li>
      <ng-container *ngIf="loading">
        <li *ngFor="let nothing of loadingCards(loadingCount); let i = index">
          <grove-campaign-card></grove-campaign-card>
        </li>
      </ng-container>
    </ul>
    <prx-paging
      [currentPage]="currentPage"
      [totalPages]="totalPages"
      (showPage)="showPage($event)">
    </prx-paging>
  `,
  styleUrls: ['campaign-list.component.scss']
})
export class CampaignListComponent implements OnInit {
  campaigns$: Observable<Campaign[]>;
  loadingCards = Array;

  constructor(private campaignListService: CampaignListService) {}

  ngOnInit() {
    this.campaigns$ = this.campaignListService.campaigns;
  }

  get loadingCount(): number {
    return this.campaignListService.count - this.campaignListService.flightsLoaded;
  }

  get loading(): boolean {
    return this.campaignListService.loading;
  }

  get currentPage(): number {
    return this.campaignListService.params.page;
  }

  get totalPages(): number {
    // TODO: implement as pipe
    const plusOne =
      this.campaignListService.total === 0 ||
      this.campaignListService.total % this.campaignListService.params.per > 0 ? 1 : 0;
    return Math.floor(this.campaignListService.total / this.campaignListService.params.per) + plusOne;
  }

  showPage(page: number) {
    this.campaignListService.loadCampaignList({page});
  }

}
