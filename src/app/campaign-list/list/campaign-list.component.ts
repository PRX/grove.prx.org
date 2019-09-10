import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Campaign, CampaignListService, Facets, CampaignParams } from '../campaign-list.service';

@Component({
  selector: 'grove-campaign-list',
  template: `
    <grove-campaign-filter
      [params]="params" [facets]="facets" (loadCampaignList)="loadCampaignList($event)">
    </grove-campaign-filter>
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
      (showPage)="loadCampaignList({page: $event})">
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
    return this.campaignListService.count - this.campaignListService.flightsLoaded >= 0 ?
      this.campaignListService.count - this.campaignListService.flightsLoaded : 0;
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

  get params(): CampaignParams {
    return this.campaignListService.params;
  }

  get facets(): Facets {
    return this.campaignListService.facets;
  }

  loadCampaignList(params: CampaignParams) {
    this.campaignListService.loadCampaignList(params);
  }

}
