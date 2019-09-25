import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material';
import * as autocomplete from './autocomplete';
import { AuthGuard, DeactivateGuard, UnauthGuard,
  IconModule, ImageModule, SpinnerModule, ToastrModule } from 'ngx-prx-styleguide';

@NgModule({
  declarations: [
    autocomplete.OptionsPipe,
    autocomplete.AutocompleteComponent
  ],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  exports: [
    IconModule,
    ImageModule,
    SpinnerModule,
    ToastrModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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
