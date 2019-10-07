import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material';
import { MatSelectModule } from '@angular/material/select';
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
  FilterTextComponent,
  FilterDateComponent } from './list';

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
    FilterDateComponent,
    CampaignListComponent,
    CampaignListTotalPagesPipe
  ],
  imports: [
    CommonModule,
    PagingModule,
    RouterModule,
    SharedModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  exports: [
    CampaignListComponent
  ],
  providers: [
    CampaignListService
  ]
})

export class CampaignListModule { }
