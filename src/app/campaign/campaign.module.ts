import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { campaignRouting, campaignComponents } from './campaign.routing';

@NgModule({
  declarations: [...campaignComponents],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    campaignRouting
  ]
})
export class CampaignModule { }
