import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
      [totalPages]="totalPer | campaignListTotalPages"
      (showPage)="showPage($event)">
    </prx-paging>
  `,
  styleUrls: ['campaign-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignListComponent implements OnInit {
  campaigns$: Observable<Campaign[]>;
  loadingCards = Array;

  constructor(private campaignListService: CampaignListService) {}

  ngOnInit() {
    this.campaignListService.loadCampaignList();
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

  get totalPer(): {total: number, per: number} {
    return {total: this.campaignListService.total, per: this.campaignListService.params.per};
  }

  showPage(page: number) {
    this.campaignListService.loadCampaignList({page});
  }

}
