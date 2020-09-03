import { Component, forwardRef, OnDestroy, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Validators, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, AbstractControl, FormBuilder } from '@angular/forms';

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
    <div [formGroup]="formGroup">
      <div class="inline-fields">
        <mat-form-field appearance="outline">
          <mat-label>Pingback Template</mat-label>
          <textarea matInput formControlName="template" rows="3"></textarea>
        </mat-form-field>
        <div class="remove-pingback">
          <button mat-icon-button aria-label="Remove pingback" (click)="removePingback.emit()">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
      <mat-error *ngIf="checkError() as error; else preview">{{ error }}</mat-error>
      <ng-template #preview
        ><p>{{ previewValue }}</p></ng-template
      >
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
  constructor(private fb: FormBuilder) {}

  get previewValue(): string {
    const template = this.formGroup.get('template');
    let preview = '';
    if (template.value) {
      preview = template.value;
      for (const param of this.findTemplateParams(template.value)) {
        if (param === 'campaign' && this.campaignId) {
          preview = preview.replace('{campaign}', this.campaignId.toString());
        }
        if (param === 'flight' && this.flightId) {
          preview = preview.replace('{flight}', this.flightId.toString());
        }
        if (param === 'creative' && this.creative) {
          preview = preview.replace('{creative}', this.creative);
        }
      }
    }
    return preview;
  }
  @Input() campaignId: string | number;
  @Input() flightId: number;
  @Input() creative: string;
  @Output() removePingback = new EventEmitter();
  formGroup = this.fb.group({
    template: ['', [Validators.required, this.validateTemplate.bind(this)]]
  });
  valueChangesSub = this.formGroup.get('template').valueChanges.subscribe(value => this.onChangeFn(value));
  onChangeFn = (value: any) => {};
  onTouchedFn = (value: any) => {};

  ngOnDestroy() {
    if (this.valueChangesSub) {
      this.valueChangesSub.unsubscribe();
    }
  }

  writeValue(value: any) {
    this.formGroup.patchValue({ template: value || '' }, { emitEvent: false, onlySelf: true });
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

  checkError() {
    return this.formGroup.get('template').getError('error');
  }
}
