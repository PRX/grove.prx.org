import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import * as autocomplete from './autocomplete';
import { AuthGuard, DeactivateGuard, UnauthGuard,
  IconModule, ImageModule, SpinnerModule, ToastrModule } from 'ngx-prx-styleguide';
import { LargeNumberPipe } from './pipes/large-number.pipe';
import { DaterangeModule } from './daterange/daterange.module';

@NgModule({
  declarations: [
    autocomplete.OptionsPipe,
    autocomplete.AutocompleteComponent,
    LargeNumberPipe
  ],
  imports: [
    CommonModule,
    DaterangeModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  exports: [
    LargeNumberPipe,
    IconModule,
    ImageModule,
    SpinnerModule,
    ToastrModule,
    DaterangeModule,
    autocomplete.OptionsPipe,
    autocomplete.AutocompleteComponent
  ],
  providers: [
    AuthGuard,
    DeactivateGuard,
    UnauthGuard
  ]
})
export class SharedModule { }
