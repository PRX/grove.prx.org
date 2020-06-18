import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { CampaignComponent } from './campaign.component';
import { CampaignNavComponent } from './nav/campaign-nav.component';
import { CampaignStatusComponent } from './status/campaign-status.component';
import { CampaignFormContainerComponent } from './form/campaign-form.container';
import { CampaignFormComponent } from './form/campaign-form.component';
import { FlightContainerComponent } from './flight/flight.container';
import { FlightFormControlContainerComponent } from './flight/flight-form-control-container.component';
import { FlightFormComponent } from './flight/flight-form.component';
import { FlightTargetsFormComponent } from './flight/flight-targets-form.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryTableComponent } from './inventory/inventory-table.component';
import { GoalFormComponent } from './inventory/goal-form.component';

const campaignChildRoutes: Routes = [
  { path: '', component: CampaignFormContainerComponent },
  { path: 'flight/:flightId', component: FlightContainerComponent }
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
  CampaignComponent,
  CampaignFormContainerComponent,
  CampaignFormComponent,
  CampaignNavComponent,
  CampaignStatusComponent,
  FlightContainerComponent,
  FlightFormControlContainerComponent,
  FlightFormComponent,
  FlightTargetsFormComponent,
  InventoryComponent,
  InventoryTableComponent,
  GoalFormComponent
];

export const campaignRouting: ModuleWithProviders = RouterModule.forChild(campaignRoutes);
