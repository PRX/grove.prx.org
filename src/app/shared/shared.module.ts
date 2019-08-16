import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard, DeactivateGuard, UnauthGuard,
  DatepickerModule, FancyFormModule, ImageModule, SelectModule, SpinnerModule,
  StatusBarModule, StickyModule, ToastrModule } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    DatepickerModule,
    FancyFormModule,
    ImageModule,
    SelectModule,
    SpinnerModule,
    StatusBarModule,
    StickyModule,
    ToastrModule
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard
  ]
})
export class SharedModule { }
