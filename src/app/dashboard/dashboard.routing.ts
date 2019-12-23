import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { DashboardComponent } from './dashboard.component';
import { FlightTableContainerComponent } from './flight-table';
import { CampaignListContainerComponent } from './campaign-list/campaign-list-container.component';

const dashboardChildRoutes: Routes = [
  { path: 'campaigns', component: CampaignListContainerComponent },
  { path: 'flights', component: FlightTableContainerComponent },
  { path: '', redirectTo: 'flights', pathMatch: 'full' }
];

const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    canDeactivate: [DeactivateGuard],
    children: dashboardChildRoutes
  }
];

export const dashboardRouting: ModuleWithProviders = RouterModule.forRoot(dashboardRoutes);
