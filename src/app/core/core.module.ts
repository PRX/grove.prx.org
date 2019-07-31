import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderModule, FooterModule, HalService, ModalModule, ModalService } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    FooterModule,
    HeaderModule,
    ModalModule
  ],
  providers: [
    HalService,
    ModalService
  ]
})
export class CoreModule { }
