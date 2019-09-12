import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { CampaignComponent } from './campaign.component';
import { CampaignFormComponent } from './form/campaign-form.component';
import { CampaignStatusComponent } from './status/campaign-status.component';
import { CampaignFormContainerComponent } from './form/campaign-form.container';

export const campaignRoutes: Routes = [
  {
    path: 'campaign/new',
    component: CampaignComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: [{ path: '', component: CampaignFormContainerComponent }]
  },
  {
    path: 'campaign/:id',
    component: CampaignComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: [{ path: '', component: CampaignFormContainerComponent }]
  }
];

export const campaignComponents: any[] = [CampaignComponent, CampaignFormComponent, CampaignStatusComponent];

export const campaignRouting: ModuleWithProviders = RouterModule.forChild(campaignRoutes);
