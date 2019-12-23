import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../shared/shared.module';
import { PagingModule } from 'ngx-prx-styleguide';

import {
  CampaignCardComponent,
  CampaignFlightDatesPipe,
  CampaignFlightTargetsPipe,
  CampaignFlightZonesPipe,
  CampaignTypePipe
} from './campaign-card';

import { DashboardComponent } from './dashboard.component';
import { dashboardRouting } from './dashboard.routing';
import { CampaignListContainerComponent, CampaignListComponent, CampaignListTotalPagesPipe } from './campaign-list';
import { DashboardFilterComponent, FilterFacetComponent, FilterTextComponent, FilterDateComponent } from './filter';
import { FlightTableContainerComponent, FlightTableComponent } from './flight-table/';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardFilterComponent,
    FilterFacetComponent,
    FilterTextComponent,
    FilterDateComponent,
    CampaignListContainerComponent,
    CampaignListComponent,
    CampaignCardComponent,
    CampaignFlightDatesPipe,
    CampaignFlightTargetsPipe,
    CampaignFlightZonesPipe,
    CampaignTypePipe,
    CampaignListTotalPagesPipe,
    FlightTableContainerComponent,
    FlightTableComponent
  ],
  imports: [
    dashboardRouting,
    CommonModule,
    PagingModule,
    RouterModule,
    SharedModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule
  ],
  exports: [DashboardComponent]
})
export class DashboardModule {}