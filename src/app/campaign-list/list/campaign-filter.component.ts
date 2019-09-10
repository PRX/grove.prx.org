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
        (selectOption)="loadCampaignList.emit({podcast: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Zone"
        [options]="facets?.zone"
        [selectedOption]="params?.zone"
        (selectOption)="loadCampaignList.emit({zone: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Geo Target"
        [options]="facets?.geo"
        [selectedOption]="params?.geo"
        (selectOption)="loadCampaignList.emit({geo: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Advertiser"
        [options]="facets?.advertiser"
        [selectedOption]="params?.advertiser"
        (selectOption)="loadCampaignList.emit({advertiser: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Status"
        [options]="facets?.status"
        [selectedOption]="params?.status"
        (selectOption)="loadCampaignList.emit({status: $event})">
      </grove-filter-facet>
      <grove-filter-facet
        facetName="Type"
        [options]="facets?.type"
        [selectedOption]="params?.type"
        (selectOption)="loadCampaignList.emit({type: $event})">
      </grove-filter-facet>
      <grove-filter-text
        textName="Campaign"
        [searchText]="params?.text"
        (search)="loadCampaignList.emit({text: $event})">
      </grove-filter-text>
      <grove-filter-text
        textName="Rep Name"
        [searchText]="params?.representative"
        (search)="loadCampaignList.emit({representative: $event})">
      </grove-filter-text>
    </div>
    <div>
      <prx-datepicker [date]="params?.after" [maxDate]="params?.before" (dateChange)="loadCampaignList.emit({after: $event})">
      </prx-datepicker>
      <prx-datepicker [date]="params?.before" [minDate]="params?.after" (dateChange)="loadCampaignList.emit({before: $event})">
      </prx-datepicker>
    </div>
  `,
  styleUrls: ['campaign-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignFilterComponent {
  @Input() params: CampaignParams;
  @Input() facets: Facets;
  @Output() loadCampaignList = new EventEmitter<CampaignParams>();
}
