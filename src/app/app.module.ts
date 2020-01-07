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
import { CampaignListModule } from './campaign-list/campaign-list.module';
import { ReactiveFormsModule } from '@angular/forms';

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
    CampaignListModule,
    ReactiveFormsModule
  ],
  providers: [{ provide: ErrorHandler, useClass: ErrorService }],
  bootstrap: [AppComponent]
})
export class AppModule {}
