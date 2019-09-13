import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CampaignParams, Facets, Facet } from '../campaign-list.service';

@Component({
  selector: 'grove-campaign-filter',
  template: `
    <div class="dates">
      <h1>Inventory Dashboard</h1>
      <grove-filter-date [after]="params?.after" [before]="params?.before" (dateChange)="campaignListParams.emit($event)">
      </grove-filter-date>
    </div>
    <div class="selects">
      <grove-filter-facet
        facetName="Podcast"
        [options]="facets?.podcast"
        [selectedOptions]="params?.podcast"
        (selectedOptionsChange)="campaignListParams.emit({podcast: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Zone"
        multiple="true"
        [options]="facets?.zone"
        [selectedOptions]="params?.zone"
        (selectedOptionsChange)="campaignListParams.emit({zone: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Geo Target"
        multiple="true"
        [options]="facets?.geo"
        [selectedOptions]="params?.geo"
        (selectedOptionsChange)="campaignListParams.emit({geo: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Advertiser"
        [options]="facets?.advertiser"
        [selectedOptions]="params?.advertiser"
        (selectedOptionsChange)="campaignListParams.emit({advertiser: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Status"
        [options]="facets?.status"
        [selectedOptions]="params?.status"
        (selectedOptionsChange)="campaignListParams.emit({status: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Type"
        [options]="facets?.type"
        [selectedOptions]="params?.type"
        (selectedOptionsChange)="campaignListParams.emit({type: $event})">
      </grove-filter-facet>
    </div>
    <div class="text">
      <grove-filter-text
        textName="Campaign"
        [searchText]="params?.text"
        (search)="campaignListParams.emit({text: $event})">
      </grove-filter-text>
      <grove-filter-text
        textName="Rep Name"
        [searchText]="params?.representative"
        (search)="campaignListParams.emit({representative: $event})">
      </grove-filter-text>
    </div>
  `,
  styleUrls: ['campaign-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFilterComponent {
  @Input() params: CampaignParams;
  @Input() facets: Facets;
  @Output() campaignListParams = new EventEmitter<CampaignParams>();
}
