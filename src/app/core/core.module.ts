import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderModule, FooterModule, HalService, ModalModule, ModalService, ToastrModule, ToastrService } from 'ngx-prx-styleguide';
import { AuguryService } from './augury.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    FooterModule,
    HeaderModule,
    ModalModule,
    ToastrModule
  ],
  providers: [
    HalService,
    ModalService,
    AuguryService,
    ToastrService
  ]
})
export class CoreModule { }
