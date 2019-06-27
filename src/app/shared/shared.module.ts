import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerModule, ImageModule } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    SpinnerModule,
    ImageModule
  ]
})
export class SharedModule { }
