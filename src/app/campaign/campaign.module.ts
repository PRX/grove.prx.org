import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { StatusBarModule, FancyFormModule } from 'ngx-prx-styleguide';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../shared/shared.module';
import * as fromCampaignState from './store';
import { AccountEffects } from './store/effects/account.effects';
import { AdvertiserEffects } from './store/effects/advertiser.effects';
import { CampaignEffects } from './store/effects/campaign.effects';
import { FlightPreviewEffects } from './store/effects/flight-preview.effects';
import { CampaignActionService } from './store/actions/campaign-action.service';
import { campaignRouting, campaignComponents } from './campaign.routing';

@NgModule({
  declarations: [...campaignComponents],
  imports: [
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    CommonModule,
    ReactiveFormsModule,
    StatusBarModule,
    FancyFormModule,
    campaignRouting,
    StoreModule.forFeature('campaignState', fromCampaignState.reducers, { metaReducers: fromCampaignState.metaReducers }),
    EffectsModule.forFeature([AccountEffects, AdvertiserEffects, CampaignEffects, FlightPreviewEffects])
  ],
  providers: [CampaignActionService]
})
export class CampaignModule {}
