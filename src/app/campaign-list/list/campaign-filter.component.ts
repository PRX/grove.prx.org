import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CampaignParams, Facets, Facet } from '../campaign-list.service';

@Component({
  selector: 'grove-campaign-filter',
  template: `
    <div>
      <grove-filter-facet
        facetName="Podcast"
        [options]="facets?.podcast"
        [selectedOption]="params?.podcast"
        (selectOption)="campaignListParams.emit({podcast: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Zone"
        [options]="facets?.zone"
        [selectedOption]="params?.zone"
        (selectOption)="campaignListParams.emit({zone: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Geo Target"
        [options]="facets?.geo"
        [selectedOption]="params?.geo"
        (selectOption)="campaignListParams.emit({geo: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Advertiser"
        [options]="facets?.advertiser"
        [selectedOption]="params?.advertiser"
        (selectOption)="campaignListParams.emit({advertiser: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Status"
        [options]="facets?.status"
        [selectedOption]="params?.status"
        (selectOption)="campaignListParams.emit({status: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Type"
        [options]="facets?.type"
        [selectedOption]="params?.type"
        (selectOption)="campaignListParams.emit({type: $event})">
      </grove-filter-facet>
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
    <div>
      <prx-datepicker [date]="params?.after" [maxDate]="params?.before" (dateChange)="campaignListParams.emit({after: $event})">
      </prx-datepicker>
      <prx-datepicker [date]="params?.before" [minDate]="params?.after" (dateChange)="campaignListParams.emit({before: $event})">
      </prx-datepicker>
    </div>
  `,
  styleUrls: ['campaign-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFilterComponent {
  @Input() params: CampaignParams;
  @Input() facets: Facets;
  @Output() campaignListParams = new EventEmitter<CampaignParams>();
}
