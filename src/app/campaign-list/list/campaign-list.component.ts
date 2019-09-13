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
      <ng-container *ngIf="loading$ | async as loading">
        <li *ngFor="let c of loading; let i = index">
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
  campaigns$: Observable<Campaign[]> = this.campaignListService.loadedCampaigns;

  constructor(private campaignListService: CampaignListService,
              private router: Router) {}

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

  get totalPer(): {total: number, per: number} {
    return {total: this.campaignListService.total, per: this.campaignListService.params.per};
  }

  get params(): CampaignParams {
    return this.campaignListService.params;
  }

  get facets(): Facets {
    return this.campaignListService.facets;
  }

  routeToParams(params: CampaignParams) {
    let { page, advertiser, podcast, status, type, text, representative } = params;
    if (!params.hasOwnProperty('page') && this.params.page) {
      page = this.params.page;
    }
    if (!params.hasOwnProperty('advertiser') && this.params.advertiser) {
      advertiser = this.params.advertiser;
    }
    if (!params.hasOwnProperty('podcast') && this.params.podcast) {
      podcast = this.params.podcast;
    }
    if (!params.hasOwnProperty('status') && this.params.status) {
      status = this.params.status;
    }
    if (!params.hasOwnProperty('type') && this.params.type) {
      type = this.params.type;
    }
    if (!params.hasOwnProperty('text') && this.params.text) {
      text = this.params.text;
    }
    if (!params.hasOwnProperty('representative') && this.params.representative) {
      representative = this.params.representative;
    }
    let before: string;
    let after: string;
    if (params.before) {
      before = params.before.toISOString();
    } else if (!params.hasOwnProperty('before') && this.params.before) {
      before = this.params.before.toISOString();
    }
    if (params.after) {
      after = params.after.toISOString();
    } else if (!params.hasOwnProperty('after') && this.params.after) {
      after = this.params.after.toISOString();
    }
    let geo;
    if (params.geo) {
      geo = params.geo.join('|');
    } else if (this.params.geo) {
      geo = this.params.geo.join('|');
    }
    let zone;
    if (params.zone) {
      zone = params.zone.join('|');
    } else if (this.params.zone) {
      zone = this.params.zone.join('|');
    }
    this.router.navigate(['/'], {queryParams: {
      ...(page && {page}),
      ...(advertiser && {advertiser}),
      ...(podcast && {podcast}),
      ...(status && {status}),
      ...(type && {type}),
      ...(before && {before}),
      ...(after && {after}),
      ...(geo && {geo}),
      ...(zone && {zone})
    }});
  }

}
