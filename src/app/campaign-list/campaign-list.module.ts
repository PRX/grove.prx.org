import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { PagingModule } from 'ngx-prx-styleguide';

import {
  CampaignCardComponent,
  CampaignFlightDatesPipe,
  CampaignFlightTargetsPipe,
  CampaignFlightZonesPipe,
  CampaignTypePipe } from './card/';

import {
  CampaignListComponent,
  CampaignListTotalPagesPipe,
  CampaignFilterComponent,
  FilterFacetComponent,
  FilterTextComponent } from './list';

import { CampaignListService } from './campaign-list.service';

@NgModule({
  declarations: [
    CampaignCardComponent,
    CampaignFlightDatesPipe,
    CampaignFlightTargetsPipe,
    CampaignFlightZonesPipe,
    CampaignTypePipe,
    CampaignFilterComponent,
    FilterFacetComponent,
    FilterTextComponent,
    CampaignListComponent,
    CampaignListTotalPagesPipe
  ],
  imports: [
    CommonModule,
    PagingModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    CampaignListComponent
  ],
  providers: [
    CampaignListService
  ]
})

export class CampaignListModule { }
