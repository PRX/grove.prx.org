import { Component, OnChanges, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Campaign, DashboardService, Facets, CampaignParams } from '../dashboard.service';

@Component({
  selector: 'grove-campaign-list',
  template: `
    <grove-campaign-filter [params]="params" [facets]="facets" (campaignListParams)="routeToParams($event)"> </grove-campaign-filter>
    <div class="campaigns-head">
      <h2>Campaigns</h2>
      <div>
        <input
          type="checkbox"
          class="updown-toggle"
          id="desc"
          [checked]="routedParams?.desc"
          (click)="routeToParams({ desc: !routedParams.desc })"
        />
        <label for="desc"></label>
      </div>
    </div>
    <ul>
      <li *ngFor="let campaign of campaigns$ | async">
        <grove-campaign-card [campaign]="campaign"></grove-campaign-card>
      </li>
      <ng-container *ngIf="loading$ | async as loading">
        <li *ngFor="let c of loading; let i = index">
          <grove-campaign-card></grove-campaign-card>
        </li>
      </ng-container>
    </ul>
    <hr />
    <prx-paging [currentPage]="currentPage" [totalPages]="totalPer | campaignListTotalPages" (showPage)="routeToParams({ page: $event })">
    </prx-paging>
    <div class="count-of-total">Showing {{ count }} of {{ total }}</div>
  `,
  styleUrls: ['campaign-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignListComponent implements OnChanges {
  @Input() routedParams: CampaignParams;
  campaigns$: Observable<Campaign[]> = this.campaignListService.loadedCampaigns;

  constructor(private campaignListService: DashboardService, private router: Router) {}

  ngOnChanges() {
    this.campaignListService.loadCampaignList(this.routedParams);
  }

  get loading$(): Observable<boolean[]> {
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

  get totalPer(): { total: number; per: number } {
    return { total: this.campaignListService.total, per: this.campaignListService.params.per };
  }

  get params(): CampaignParams {
    return this.campaignListService.params;
  }

  get facets(): Facets {
    return this.campaignListService.facets;
  }

  routeToParams(partialParams: CampaignParams) {
    const {
      page,
      advertiser,
      podcast,
      status,
      type,
      before,
      after,
      geo,
      zone,
      text,
      representative,
      desc
    } = this.campaignListService.getRouteQueryParams(partialParams);
    this.router.navigate(['/'], {
      queryParams: {
        ...(page && { page }),
        ...(advertiser && { advertiser }),
        ...(podcast && { podcast }),
        ...(status && { status }),
        ...(type && { type }),
        ...(before && { before }),
        ...(after && { after }),
        ...(geo && { geo }),
        ...(zone && { zone }),
        ...(text && { text }),
        ...(representative && { representative }),
        ...(desc !== undefined && { desc })
      }
    });
  }
}
