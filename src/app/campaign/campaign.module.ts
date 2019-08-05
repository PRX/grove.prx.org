import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { TabModule } from 'ngx-prx-styleguide';
import { campaignRouting, campaignComponents } from './campaign.routing';
import { CampaignListComponent } from './campaign-list.component';
import { CampaignService } from './campaign.service';

@NgModule({
  declarations: [
    ...campaignComponents
  ],
  imports: [
    CommonModule,
    SharedModule,
    TabModule,
    campaignRouting
  ],
  exports: [
    CampaignListComponent
  ],
  providers: [
    CampaignService
  ]
})

export class CampaignModule { }
