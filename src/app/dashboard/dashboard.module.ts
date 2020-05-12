import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../shared/shared.module';
import { PagingModule } from 'ngx-prx-styleguide';

import {
  CampaignCardComponent,
  CampaignFlightDatesPipe,
  CampaignFlightTargetsPipe,
  CampaignFlightZonesPipe,
  CampaignCardAbbreviateNumberPipe
} from './campaign-card';

import { DashboardComponent } from './dashboard.component';
import { dashboardRouting } from './dashboard.routing';
import { CampaignListComponent, CampaignListSortComponent, CampaignListTotalPagesPipe } from './campaign-list';
import { DashboardFilterComponent, FilterFacetComponent, FilterTextComponent, FilterDateComponent } from './filter';
import { FlightTableContainerComponent, FlightTableComponent } from './flight-table/';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardFilterComponent,
    FilterFacetComponent,
    FilterTextComponent,
    FilterDateComponent,
    CampaignListComponent,
    CampaignCardComponent,
    CampaignCardAbbreviateNumberPipe,
    CampaignFlightDatesPipe,
    CampaignFlightTargetsPipe,
    CampaignFlightZonesPipe,
    CampaignListSortComponent,
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
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSelectModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule
  ],
  exports: [DashboardComponent]
})
export class DashboardModule {}
