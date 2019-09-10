import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { campaignRouting, campaignComponents } from './campaign.routing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CampaignComponent } from './campaign.component';
import { StatusBarModule } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [...campaignComponents, CampaignComponent],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    StatusBarModule,
    campaignRouting
  ]
})
export class CampaignModule {}
