import { ErrorStateMatcher } from '@angular/material';
import { FormGroupDirective, FormControl } from '@angular/forms';

export class FlightFormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective): boolean {
    // form controls are showing as dirty but not as touched until after blur which isn't great for date pickers and validate on change
    // so this ErrorStateMatcher overrides material to show errors when these controls are invalid and dirty (or touched)
    return control && control.invalid && (control.dirty || control.touched);
  }
}
