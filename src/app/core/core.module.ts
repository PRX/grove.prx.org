import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderModule, FooterModule, HalService, ModalModule, ModalService, ToastrModule, ToastrService } from 'ngx-prx-styleguide';
import { AuguryService } from './augury.service';
import { AdvertiserService } from './advertiser/advertiser.service';
import { CampaignService } from './campaign/campaign.service';
import { CreativeService } from './creative/creative.service';
import { FlightPreviewService } from './campaign/flight-preview.service';
import { UserService } from './user/user.service';
import { InventoryService } from './inventory/inventory.service';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [FooterModule, HeaderModule, ModalModule, ToastrModule],
  providers: [
    AuguryService,
    AdvertiserService,
    InventoryService,
    CampaignService,
    CreativeService,
    FlightPreviewService,
    UserService,
    HalService,
    ModalService,
    ToastrService
  ]
})
export class CoreModule {}
