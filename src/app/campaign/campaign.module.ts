import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { TabModule } from 'ngx-prx-styleguide';
import { campaignRouting, campaignComponents } from './campaign.routing';
import { CampaignListComponent } from './list/campaign-list.component';
import { AdvertiserService } from './service/advertiser.service';
import { CampaignService } from './service/campaign.service';
import { InventoryService } from './service/inventory.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ...campaignComponents
  ],
  imports: [
    FormsModule,
    NgSelectModule,
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
    InventoryService,
    CampaignService
  ]
})

export class CampaignModule { }
