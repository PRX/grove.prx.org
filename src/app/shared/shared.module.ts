import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import * as autocomplete from './autocomplete';
import { CSSPropsDirective } from './css-props/css-props.directive';
import { AuthGuard, DeactivateGuard, UnauthGuard, IconModule, ImageModule, SpinnerModule, ToastrModule } from 'ngx-prx-styleguide';
import { GeoTargetsPipe } from './pipes/geo-targets.pipe';
import { LargeNumberPipe } from './pipes/large-number.pipe';
import { UniquePipe } from './pipes/unique.pipe';
import { ZoneLabelPipe } from './pipes/zone-label.pipe';
@NgModule({
  declarations: [
    autocomplete.OptionsPipe,
    autocomplete.AutocompleteComponent,
    CSSPropsDirective,
    GeoTargetsPipe,
    LargeNumberPipe,
    UniquePipe,
    ZoneLabelPipe
  ],
  imports: [CommonModule, MatAutocompleteModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  exports: [
    GeoTargetsPipe,
    LargeNumberPipe,
    UniquePipe,
    ZoneLabelPipe,
    IconModule,
    ImageModule,
    SpinnerModule,
    ToastrModule,
    autocomplete.OptionsPipe,
    autocomplete.AutocompleteComponent,
    CSSPropsDirective
  ],
  providers: [AuthGuard, DeactivateGuard, UnauthGuard]
})
export class SharedModule {}
