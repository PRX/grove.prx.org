import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard, DeactivateGuard, UnauthGuard,
  DatepickerModule, IconModule, ImageModule, SpinnerModule, ToastrModule } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    DatepickerModule,
    IconModule,
    ImageModule,
    SpinnerModule,
    ToastrModule
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard
  ]
})
export class SharedModule { }
