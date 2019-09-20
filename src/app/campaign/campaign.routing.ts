import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { CampaignFormComponent } from './campaign-form.component';
import { CampaignFormAdvertiserComponent } from './campaign-form-advertiser.component';

export const campaignRoutes: Routes = [
  {
    path: 'campaign/new',
    component: CampaignFormComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard]
  },
  {
    path: 'campaign/:id',
    component: CampaignFormComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard]
  }
];

export const campaignComponents: any[] = [CampaignFormComponent, CampaignFormAdvertiserComponent];

export const campaignRouting: ModuleWithProviders = RouterModule.forChild(campaignRoutes);
