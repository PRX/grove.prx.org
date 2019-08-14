import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { CampaignListComponent } from './list/campaign-list.component';
import { CampaignListPagingComponent } from './list/campaign-list-paging.component';
import { CampaignContainerComponent } from './campaign-container.component';
import { CampaignComponent } from './campaign.component';
import { CampaignFormComponent } from './form/campaign-form.component';
import { FlightFormComponent } from './form/flight-form.component';
import { CampaignStatusComponent } from './campaign-status.component';

const campaignChildRoutes = [
  { path: '', component: CampaignFormComponent },
  { path: 'flight/:flightId', component: FlightFormComponent }
];

export const campaignRoutes: Routes = [
  {
    path: 'campaign/new',
    component: CampaignContainerComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: campaignChildRoutes
  },
  {
    path: 'campaign/:id',
    component: CampaignContainerComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: campaignChildRoutes
  }
];

export const campaignComponents: any[] = [
  CampaignListComponent,
  CampaignListPagingComponent,
  CampaignContainerComponent,
  CampaignComponent,
  CampaignFormComponent,
  FlightFormComponent,
  CampaignStatusComponent
];

export const campaignRouting: ModuleWithProviders = RouterModule.forChild(campaignRoutes);
