import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, DeactivateGuard } from 'ngx-prx-styleguide';

import { DashboardComponent } from './dashboard.component';
import { FlightTableContainerComponent } from './flight-table';
import { CampaignListComponent } from './campaign-list/campaign-list.component';

const dashboardChildRoutes: Routes = [
  { path: 'campaigns', component: CampaignListComponent },
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
