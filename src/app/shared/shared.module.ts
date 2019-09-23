import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard, DeactivateGuard, UnauthGuard,
  DatepickerModule, IconModule, ImageModule, SpinnerModule, ToastrModule } from 'ngx-prx-styleguide';
import {
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule } from '@angular/material';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    IconModule,
    ImageModule,
    SpinnerModule,
    ToastrModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard
  ]
})
export class SharedModule { }
