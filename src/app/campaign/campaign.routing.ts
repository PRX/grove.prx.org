import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { CampaignComponent } from './campaign.component';
import { CampaignFormComponent } from './form/campaign-form.component';
import { CampaignStatusComponent } from './status/campaign-status.component';
import { CampaignFormContainerComponent } from './form/campaign-form.container';
import { FlightComponent } from './flight/flight.component';

const campaignChildRoutes: Routes = [
  { path: '', component: CampaignFormContainerComponent },
  { path: 'flight/:id', component: FlightComponent }
];

export const campaignRoutes: Routes = [
  {
    path: 'campaign/new',
    component: CampaignComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: campaignChildRoutes
  },
  {
    path: 'campaign/:id',
    component: CampaignComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: campaignChildRoutes
  }
];

export const campaignComponents: any[] = [CampaignComponent, CampaignFormComponent, CampaignStatusComponent];

export const campaignRouting: ModuleWithProviders = RouterModule.forChild(campaignRoutes);
