import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';

import { AuthModule } from 'ngx-prx-styleguide';
import { ErrorService } from './error/error.service';

import { AppRoutingModule, routingComponents } from './app.routing.module';
import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { CampaignModule } from './campaign/campaign.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardModule } from './dashboard/dashboard.module';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent, routingComponents],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    CoreModule,
    SharedModule,
    Angulartics2Module.forRoot(),
    CampaignModule,
    BrowserAnimationsModule,
    DashboardModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreModule.forRoot({
      router: routerReducer
    }),
    // Connects RouterModule with StoreModule
    StoreRouterConnectingModule.forRoot(),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  providers: [{ provide: ErrorHandler, useClass: ErrorService }],
  bootstrap: [AppComponent]
})
export class AppModule {}
