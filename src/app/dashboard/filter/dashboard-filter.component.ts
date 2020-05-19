import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DashboardService, DashboardParams, Facets } from '../dashboard.service';

@Component({
  selector: 'grove-dashboard-filter',
  template: `
    <div class="dates">
      <h1>Inventory Dashboard</h1>
      <grove-filter-date [after]="params?.after" [before]="params?.before" (dateChange)="onDateChange($event)"> </grove-filter-date>
    </div>
    <div class="selects">
      <grove-filter-facet
        facetName="Podcast"
        [options]="facets?.podcast | labelOrder: 'label'"
        [selectedOptions]="params?.podcast"
        (selectedOptionsChange)="routeToParams({ podcast: $event })"
      >
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Zone"
        multiple="true"
        [options]="facets?.zone"
        [selectedOptions]="params?.zone"
        (selectedOptionsChange)="routeToParams({ zone: $event })"
      >
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Geo Target"
        multiple="true"
        [options]="facets?.geo | labelOrder: 'label'"
        [selectedOptions]="params?.geo"
        (selectedOptionsChange)="routeToParams({ geo: $event })"
      >
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Advertiser"
        [options]="facets?.advertiser | labelOrder: 'label'"
        [selectedOptions]="params?.advertiser"
        (selectedOptionsChange)="routeToParams({ advertiser: $event })"
      >
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Status"
        [options]="facets?.status"
        [selectedOptions]="params?.status"
        (selectedOptionsChange)="routeToParams({ status: $event })"
      >
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Type"
        [options]="facets?.type"
        [selectedOptions]="params?.type"
        (selectedOptionsChange)="routeToParams({ type: $event })"
      >
      </grove-filter-facet>
    </div>
    <div class="text">
      <grove-filter-text textName="Campaign" [searchText]="params?.text" (search)="routeToParams({ text: $event })"> </grove-filter-text>
      <grove-filter-text textName="Rep Name" [searchText]="params?.representative" (search)="routeToParams({ representative: $event })">
      </grove-filter-text>
    </div>
  `,
  styleUrls: ['dashboard-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardFilterComponent {
  @Input() params: DashboardParams;
  @Input() facets: Facets;

  constructor(private dashboardService: DashboardService) {}

  onDateChange(dates: { before?: Date; after?: Date }) {
    this.routeToParams({ ...dates });
  }

  routeToParams(params: DashboardParams) {
    this.dashboardService.routeToParams({ ...params, page: 1 });
  }
}
