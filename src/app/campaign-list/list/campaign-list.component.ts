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

  routeToParams(partialParams: CampaignParams) {
    let { page, advertiser, podcast, status, type, text, representative } = partialParams;

    // this function takes partial parameters (what changed)
    // mix in the existing this.params unless property was explicitly set in partialParams
    if (!partialParams.hasOwnProperty('page') && this.params.page) {
      page = this.params.page;
    }
    if (!partialParams.hasOwnProperty('advertiser') && this.params.advertiser) {
      advertiser = this.params.advertiser;
    }
    if (!partialParams.hasOwnProperty('podcast') && this.params.podcast) {
      podcast = this.params.podcast;
    }
    if (!partialParams.hasOwnProperty('status') && this.params.status) {
      status = this.params.status;
    }
    if (!partialParams.hasOwnProperty('type') && this.params.type) {
      type = this.params.type;
    }
    if (!partialParams.hasOwnProperty('text') && this.params.text) {
      text = this.params.text;
    }
    if (!partialParams.hasOwnProperty('representative') && this.params.representative) {
      representative = this.params.representative;
    }
    let before: string;
    let after: string;
    if (partialParams.before) {
      before = partialParams.before.toISOString();
    } else if (!partialParams.hasOwnProperty('before') && this.params.before) {
      before = this.params.before.toISOString();
    }
    if (partialParams.after) {
      after = partialParams.after.toISOString();
    } else if (!partialParams.hasOwnProperty('after') && this.params.after) {
      after = this.params.after.toISOString();
    }
    let geo;
    if (partialParams.geo) {
      geo = partialParams.geo.join('|');
    } else if (this.params.geo) {
      geo = this.params.geo.join('|');
    }
    let zone;
    if (partialParams.zone) {
      zone = partialParams.zone.join('|');
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
      ...(zone && {zone}),
      ...(text && {text}),
      ...(representative && {representative})
    }});
  }

}
