import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderModule, FooterModule, HalService, ModalModule, ModalService } from 'ngx-prx-styleguide';
import { AuguryService } from './augury.service';

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
    ModalService,
    AuguryService
  ]
})
export class CoreModule { }
