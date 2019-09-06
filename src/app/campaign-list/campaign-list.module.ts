import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { PagingModule } from 'ngx-prx-styleguide';
import { CampaignCardComponent } from './campaign-card.component';
import { CampaignFlightDatesPipe } from './campaign-flight-dates.pipe';
import { CampaignFlightTargetsPipe } from './campaign-flight-targets.pipe';
import { CampaignFlightZonesPipe } from './campaign-flight-zones.pipe';
import { CampaignTypePipe } from './campaign-type.pipe';
import { CampaignListComponent } from './campaign-list.component';
import { CampaignListService } from './campaign-list.service';

@NgModule({
  declarations: [
    CampaignCardComponent,
    CampaignFlightDatesPipe,
    CampaignFlightTargetsPipe,
    CampaignFlightZonesPipe,
    CampaignTypePipe,
    CampaignListComponent
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
