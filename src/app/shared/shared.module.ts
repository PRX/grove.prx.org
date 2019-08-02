import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard, DeactivateGuard, UnauthGuard,
  FancyFormModule, ImageModule, SpinnerModule, SelectModule  } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    FancyFormModule,
    ImageModule,
    SelectModule,
    SpinnerModule
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard
  ]
})
export class SharedModule { }
