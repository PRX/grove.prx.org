import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard, UnauthGuard } from 'ngx-prx-styleguide';

import { AuthorizationComponent } from './authorization/authorization.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { TokenAuthComponent } from './tokenauth/tokenauth.component';

const routes: Routes = [
  { path: 'permission-denied', component: AuthorizationComponent },
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [UnauthGuard] },
  { path: 'tokenauth', component: TokenAuthComponent, canActivate: [UnauthGuard] }
];

export const routingComponents: any[] = [AuthorizationComponent, LoginComponent, TokenAuthComponent];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
