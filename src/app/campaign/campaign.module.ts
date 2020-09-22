import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { StatusBarModule, FancyFormModule } from 'ngx-prx-styleguide';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from '../shared/shared.module';
import * as fromCampaignState from './store';
import { AccountEffects } from './store/effects/account.effects';
import { AdvertiserEffects } from './store/effects/advertiser.effects';
import { CampaignEffects } from './store/effects/campaign.effects';
import { CreativeEffects } from './store/effects/creative.effects';
import { FlightPreviewEffects } from './store/effects/flight-preview.effects';
import { InventoryEffects } from './store/effects/inventory.effects';
import { CampaignActionService } from './store/actions/campaign-action.service';
import { CampaignErrorService } from './campaign-error.service';
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
    MatAutocompleteModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatToolbarModule,
    CommonModule,
    ReactiveFormsModule,
    StatusBarModule,
    FancyFormModule,
    campaignRouting,
    StoreModule.forFeature('campaignState', fromCampaignState.reducers, { metaReducers: fromCampaignState.metaReducers }),
    EffectsModule.forFeature([AccountEffects, AdvertiserEffects, CampaignEffects, CreativeEffects, FlightPreviewEffects, InventoryEffects])
  ],
  providers: [
    CampaignActionService,
    CampaignErrorService,
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { horizontalPosition: 'center', verticalPosition: 'top' } }
  ]
})
export class CampaignModule {}
