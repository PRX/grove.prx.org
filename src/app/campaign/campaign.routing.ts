import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { CampaignListComponent } from './campaign-list.component';
import { CampaignComponent } from './campaign.component';
import { CampaignFormComponent } from './campaign-form.component';
import { CampaignStatusComponent } from './campaign-status.component';

const campaignChildRoutes = [
  { path: '', component: CampaignFormComponent }
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

export const campaignComponents: any[] = [
  CampaignListComponent,
  CampaignComponent,
  CampaignFormComponent,
  CampaignStatusComponent
];

export const campaignRouting: ModuleWithProviders = RouterModule.forChild(campaignRoutes);
