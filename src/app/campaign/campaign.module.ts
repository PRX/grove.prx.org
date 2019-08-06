import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { TabModule } from 'ngx-prx-styleguide';
import { campaignRouting, campaignComponents } from './campaign.routing';
import { CampaignListComponent } from './list/campaign-list.component';
import { AdvertiserService } from './service/advertiser.service';
import { CampaignService } from './service/campaign.service';

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
    AdvertiserService,
    CampaignService
  ]
})

export class CampaignModule { }
