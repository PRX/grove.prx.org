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
import { FlightZonesFormComponent } from './flight/flight-zones-form.component';
import { CreativePingbacksFormComponent } from './creative/pingbacks/creative-pingbacks-form.component';
import { PingbackFormComponent } from './creative/pingbacks/pingback-form.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryTableComponent } from './inventory/inventory-table.component';
import { GoalFormComponent } from './inventory/goal-form.component';
import { CampaignReportComponent } from './report/campaign-report.component';
import { CreativeFormContainerComponent } from './creative/creative-form-container.component';
import { CreativeFormComponent } from './creative/creative-form.component';
import { CreativeListComponent } from './creative/creative-list.component';
import { CreativeCardComponent } from './creative/creative-card.component';

const flightChildRoutes: Routes = [
  { path: 'zone/:zoneId/creative/list', component: CreativeListComponent },
  { path: 'zone/:zoneId/creative/:creativeId', component: CreativeFormContainerComponent }
];

const campaignChildRoutes: Routes = [
  { path: '', component: CampaignFormContainerComponent },
  { path: 'flight/:flightId', component: FlightContainerComponent, children: flightChildRoutes }
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
  FlightZonesFormComponent,
  CreativePingbacksFormComponent,
  PingbackFormComponent,
  InventoryComponent,
  InventoryTableComponent,
  GoalFormComponent,
  CampaignReportComponent,
  CreativeFormContainerComponent,
  CreativeFormComponent,
  CreativeListComponent,
  CreativeCardComponent
];

export const campaignRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(campaignRoutes);
