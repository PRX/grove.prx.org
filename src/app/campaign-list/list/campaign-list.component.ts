import { Component, OnChanges, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Campaign, CampaignListService, Facets, CampaignParams } from '../campaign-list.service';

@Component({
  selector: 'grove-campaign-list',
  template: `
    <grove-campaign-filter
      [params]="params" [facets]="facets" (campaignListParams)="routeToParams($event)">
    </grove-campaign-filter>
    <h2>Campaigns</h2>
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
    <hr>
    <prx-paging
      [currentPage]="currentPage"
      [totalPages]="totalPer | campaignListTotalPages"
      (showPage)="routeToParams({page: $event})">
    </prx-paging>
    <div class="count-of-total">Showing {{count}} of {{total}}</div>
  `,
  styleUrls: ['campaign-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignListComponent implements OnChanges {
  @Input() routedParams: CampaignParams;
  campaigns$: Observable<Campaign[]> = this.campaignListService.campaigns;
  loadingCards = Array;

  constructor(private campaignListService: CampaignListService,
              private router: Router) {}

  ngOnChanges() {
    this.campaignListService.loadCampaignList(this.routedParams);
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

  get count(): number {
    return this.campaignListService.count;
  }

  get total(): number {
    return this.campaignListService.total;
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

  removePer(params): CampaignParams {
    // per is not a routable param
    const { per, ...remainingNewParams } = params;
    return remainingNewParams;
  }

  routeToParams(params: CampaignParams) {
    const before = params.before === null ? '' :
      (params.before && params.before.toISOString()) ||
      (this.params.before && this.params.before.toISOString());
    const after = params.after === null ? '' :
      (params.after && params.after.toISOString()) ||
      (this.params.after && this.params.after.toISOString());
    this.router.navigate(['/'], {queryParams: {
      ...this.removePer(this.params),
      ...this.removePer(params),
      ...((before || before === '') && {before}),
      ...((after || after === '') && {after})
    }});
  }

}
