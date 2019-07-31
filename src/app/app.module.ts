import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';

import { AuthModule } from 'ngx-prx-styleguide';
import { ErrorService } from './error/error.service';

import { AppRoutingModule, routingComponents } from './app.routing.module';
import { AppComponent } from './app.component';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { Angulartics2Module } from 'angulartics2';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    CoreModule,
    SharedModule,
    Angulartics2Module.forRoot()
  ],
  providers: [
    {provide: ErrorHandler, useClass: ErrorService}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
