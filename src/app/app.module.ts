import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';

import { Angulartics2Module } from 'angulartics2';

import { AuthModule } from 'ngx-prx-styleguide';
import { ErrorService } from './error/error.service';

import { AppRoutingModule, routingComponents } from './app.routing.module';
import { AppComponent } from './app.component';

import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import {
  MatMomentDateModule,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS
} from '@angular/material-moment-adapter';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { CampaignModule } from './campaign/campaign.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardModule } from './dashboard/dashboard.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { reducers, metaReducers } from './store/reducers';
import { CustomRouterSerializer } from './store/router-store/custom-router-serializer';
import { environment } from '../environments/environment';

const PREFERRED_DATE_FORMATS = {
  ...MAT_MOMENT_DATE_FORMATS,
  display: {
    ...MAT_MOMENT_DATE_FORMATS.display,
    dateInput: 'MM/DD/YYYY'
  }
};

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
    MatMomentDateModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreModule.forRoot({ router: routerReducer }),
    StoreRouterConnectingModule.forRoot({ serializer: CustomRouterSerializer }),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  providers: [
    { provide: ErrorHandler, useClass: ErrorService },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: PREFERRED_DATE_FORMATS }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
