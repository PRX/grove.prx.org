import { NgModule } from '@angular/core';
import { DaterangePortalComponent } from './daterange-portal.component';
import { DaterangeComponent } from './daterange.component';
import { DaterangeOverlayComponent } from './daterange-overlay.component';
import { MatNativeDateModule, MatDatepickerModule, MatFormFieldModule, MatInputModule, MatButtonModule } from '@angular/material';

@NgModule({
  declarations: [
    DaterangePortalComponent,
    DaterangeComponent,
    DaterangeOverlayComponent
  ],
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  exports: [
    DaterangeComponent
  ],
  entryComponents: [ DaterangePortalComponent ]
})

export class DaterangeModule { }
