import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, Validators, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormControl } from '@angular/forms';
import { InventoryTargets, InventoryTarget, FlightTarget, InventoryTargetType } from '../store/models';
import moment from 'moment';

@Component({
  selector: 'grove-flight-targets',
  template: `
    <fieldset *ngIf="targets">
      <h2>Targets</h2>
      <div *ngFor="let target of targets.controls; let i = index" [formGroup]="target" class="inline-fields">
        <mat-form-field class="target-type" appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type" required #type>
            <mat-option *ngFor="let opt of typeOptions" [value]="opt.id">{{ opt.label }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field class="target-code" appearance="outline">
          <mat-label>Target</mat-label>
          <mat-select formControlName="code" required #code>
            <mat-option *ngFor="let opt of codeOptions[i]" [value]="opt.code">{{ opt.label }}</mat-option>
          </mat-select>
        </mat-form-field>
        <div class="target-exclude mat-form-field-wrapper">
          <mat-checkbox formControlName="exclude">Exclude</mat-checkbox>
        </div>
        <div class="remove-target mat-form-field-wrapper">
          <button mat-icon-button aria-label="Remove target" (click)="removeTarget(i)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
      <div class="add-target">
        <button mat-button color="primary" [matMenuTriggerFor]="addTargetMenu"><mat-icon>add</mat-icon> Add a target</button>
        <mat-menu #addTargetMenu="matMenu">
          <button mat-menu-item *ngFor="let type of targetTypes" (click)="addTarget(type.type)">{{ type.label }}</button>
        </mat-menu>
      </div>
    </fieldset>
  `,
  styleUrls: ['flight-targets-form.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: FlightTargetsFormComponent, multi: true },
    { provide: NG_VALIDATORS, useExisting: FlightTargetsFormComponent, multi: true }
  ]
})
export class FlightTargetsFormComponent implements ControlValueAccessor {
  // tslint:disable-next-line
  private _targetOptions: InventoryTargets;
  get targetOptions() {
    return this._targetOptions;
  }
  @Input()
  set targetOptions(targetOptions: InventoryTargets) {
    this._targetOptions = targetOptions;
    this.setCodeOptions(this.targets ? (this.targets.value as FlightTarget[]) : []);
  }
  @Input() targetTypes: InventoryTargetType[];
  @Output() addZone = new EventEmitter<{ target: FlightTarget }>();
  @Output() removeZone = new EventEmitter<{ index: number }>();

  targets: FormArray;
  onChangeFn: (value: any) => void;
  onTouchedFn: (value: any) => void;
  typeOptions = [
    { id: 'episode', label: 'Episode' },
    { id: 'country', label: 'Country' }
  ];
  codeOptions: InventoryTarget[][];

  newFlightTarget(target: FlightTarget) {
    return new FormGroup({
      type: new FormControl(target.type, Validators.required),
      code: new FormControl(target.code, Validators.required),
      exclude: new FormControl(target.exclude || false)
    });
  }

  writeValue(targets: FlightTarget[]) {
    this.setCodeOptions(targets);
    this.targets = new FormArray((targets || []).map(this.newFlightTarget));
    // TODO: wouldn't this be leaking subscriptions? Instead of new'ing the FormArray and subscribing on each update,
    //  it should update/add/remove the controls in the array
    this.targets.valueChanges.subscribe(formTargets => {
      this.setCodeOptions(formTargets);
      this.onChangeFn(this.validTargetCodes(formTargets));
    });
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: (value: any) => void) {
    this.onTouchedFn = fn;
  }

  // tslint:disable-next-line
  validate(_control: FormControl) {
    return !this.targets || this.targets.valid ? null : { error: 'Invalid targets' };
  }

  addTarget() {
    this.targets.markAsDirty();
    this.targets.push(this.newFlightTarget({ type: '', code: '', exclude: false }));
  }

  removeTarget(index: number) {
    this.targets.markAsDirty();
    this.targets.removeAt(index);
  }

  private validTargetCodes(targets: FlightTarget[]) {
    return targets.filter(({ type, code }, index) => {
      if (!type || !code) {
        return false;
      } else if (!this.codeOptions[index].find(opt => opt.code === code)) {
        // the type changed, and now the code is stale ... clear it!
        this.targets
          .at(index)
          .get('code')
          .setValue('');
        return false;
      } else {
        return true;
      }
    });
  }

  private setCodeOptions(targets: FlightTarget[]) {
    this.codeOptions = (targets || []).map(target => {
      return this.filteredTargetOptions(target.type, target.code, targets);
    });
  }

  private filteredTargetOptions(type: string, code: string, currentTargets: FlightTarget[]) {
    return this.targetCodesForType(type).filter(opt => {
      if (opt.type === type && opt.code === code) {
        return true;
      } else {
        return !currentTargets.find(t => opt.type === t.type && opt.code === t.code);
      }
    });
  }

  private targetCodesForType(type: string) {
    if (this.targetOptions && type === 'episode') {
      return this.targetOptions.episodes.sort(this.compareEpisodes).map(this.formatEpisodeLabel);
    } else if (this.targetOptions && type === 'country') {
      return this.targetOptions.countries.sort((a, b) => a.label.localeCompare(b.label));
    } else {
      return [];
    }
  }

  private compareEpisodes(a: InventoryTarget, b: InventoryTarget) {
    const apub = a.metadata ? a.metadata.publishedAt || a.metadata.releasedAt : null;
    const bpub = b.metadata ? b.metadata.publishedAt || b.metadata.releasedAt : null;
    if (apub && bpub) {
      return bpub.localeCompare(apub);
    } else {
      return a.label.localeCompare(b.label);
    }
  }

  private formatEpisodeLabel(t: InventoryTarget) {
    const pub = t.metadata ? t.metadata.publishedAt || t.metadata.releasedAt : null;
    if (pub) {
      const date = moment(pub).format('l');
      return { ...t, label: `${date} - ${t.label}` };
    } else {
      return t;
    }
  }
}
