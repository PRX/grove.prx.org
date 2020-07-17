import { Component, forwardRef, OnDestroy, ChangeDetectionStrategy, NgZone, ViewChild, Input } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Validators, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, FormBuilder } from '@angular/forms';
import { FlightFormErrorStateMatcher } from '../flight-form.error-state-matcher';
import { take } from 'rxjs/operators';

export const VALID_TEMPLATE_PARAMS = [
  'ad',
  'agent',
  'agentmd5',
  'episode',
  'campaign',
  'creative',
  'flight',
  'ip',
  'ipmask',
  'listener',
  'listenerepisode',
  'podcast',
  'randomstr',
  'randomint',
  'referer',
  'timestamp',
  'url'
];

@Component({
  selector: 'grove-pingback',
  template: `
    <div [formGroup]="formGroup" class="inline-fields">
      <mat-form-field appearance="outline">
        <mat-label>Pingback</mat-label>
        <textarea
          matInput
          formControlName="template"
          [errorStateMatcher]="matcher"
          cdkTextareaAutosize
          #template="cdkTextareaAutosize"
          cdkAutosizeMinRows="1"
          cdkAutosizeMaxRows="5"
        ></textarea>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Preview</mat-label>
        <textarea
          readonly
          matInput
          formControlName="preview"
          [errorStateMatcher]="matcher"
          cdkTextareaAutosize
          #preview="cdkTextareaAutosize"
          cdkAutosizeMinRows="1"
          cdkAutosizeMaxRows="5"
        ></textarea>
      </mat-form-field>
    </div>
  `,
  styleUrls: ['./pingback-form.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PingbackFormComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: PingbackFormComponent, multi: true }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PingbackFormComponent implements ControlValueAccessor, OnDestroy {
  @ViewChild('template', { static: false }) autosizePingback: CdkTextareaAutosize;
  @ViewChild('preview', { static: false }) autosizePreview: CdkTextareaAutosize;
  @Input() campaignId: string | number;
  @Input() flightId: number;
  @Input() creative: string;
  @Input() podcastId: string;
  matcher = new FlightFormErrorStateMatcher();
  formGroup = this.fb.group({
    template: ['', [Validators.required, this.validateTemplate.bind(this)]],
    preview: ['']
  });
  valueChangesSub = this.formGroup.get('template').valueChanges.subscribe(template => {
    this.triggerResize();
    // set preview or error
    const previewFormControl = this.formGroup.get('preview');
    previewFormControl.setValue(this.previewValue(template), { emitEvent: false });
    previewFormControl.markAsDirty();
    if (this.formGroup.get('template').getError('error')) {
      previewFormControl.setErrors({ error: 'Invalid URL' });
    }
    if (this.formGroup.valid) {
      this.onChangeFn(template);
    }
  });
  onChangeFn = (value: any) => {};
  onTouchedFn = (value: any) => {};

  constructor(private ngZone: NgZone, private fb: FormBuilder) {}

  ngOnDestroy() {
    if (this.valueChangesSub) {
      this.valueChangesSub.unsubscribe();
    }
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      this.autosizePingback.resizeToFitContent(true);
      this.autosizePreview.resizeToFitContent(true);
    });
  }

  previewValue(template: string): string {
    let preview = '';
    if (template) {
      const templateError = this.formGroup.get('template').getError('error');
      if (templateError) {
        preview = templateError;
      } else {
        preview = template;
        for (const param of this.findTemplateParams(template)) {
          if (param === 'campaign' && this.campaignId) {
            preview = preview.replace('{campaign}', this.campaignId.toString());
          }
          if (param === 'flight' && this.flightId) {
            preview = preview.replace('{flight}', this.flightId.toString());
          }
          if (param === 'creative' && this.creative) {
            preview = preview.replace('{creative}', this.creative);
          }
          if (param === 'podcast' && this.podcastId) {
            preview = preview.replace('{podcast}', this.podcastId);
          }
        }
      }
    }
    return preview;
  }

  writeValue(value: any) {
    this.formGroup.patchValue(
      {
        template: value || '',
        preview: this.previewValue(value)
      },
      { emitEvent: false, onlySelf: true }
    );
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: (value: any) => void) {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean) {
    Object.keys(this.formGroup.controls).forEach(key => {
      isDisabled ? this.formGroup.controls[key].disable({ emitEvent: false }) : this.formGroup.controls[key].enable({ emitEvent: false });
    });
  }

  validate(_: AbstractControl) {
    return this.formGroup.valid ? null : { error: 'ERROR: Invalid URL' };
  }

  findTemplateParams(value: string) {
    const params = value.split('{').map(v => v.slice(0, v.indexOf('}')));
    return params.slice(1);
  }

  checkInvalidTemplateParams(value: string): string[] {
    const invalidTemplateParams = [];
    const params = this.findTemplateParams(value);
    for (const param of params) {
      if (!VALID_TEMPLATE_PARAMS.find(p => p === param)) {
        invalidTemplateParams.push(param);
      }
    }
    return invalidTemplateParams;
  }

  validateTemplate(template: AbstractControl): { [key: string]: any } | null {
    if (template.value) {
      try {
        // try parsing as URL, throws Error if invalid
        const url = new URL(template.value);
        const invalidTemplateParams = this.checkInvalidTemplateParams(template.value);

        if (invalidTemplateParams.length) {
          throw Error(`${invalidTemplateParams.join(', ')} not allowed`);
        }
      } catch (error) {
        return { error: `Invalid pingback template: ${error}` };
      }
    }
    return null;
  }
}
