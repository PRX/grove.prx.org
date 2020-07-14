import { Component, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, Validators, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormControl } from '@angular/forms';
import { InventoryTarget, FlightTarget, InventoryTargetType, InventoryTargetsMap } from '../store/models';
import moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'grove-flight-targets',
  template: `
    <fieldset *ngIf="ready">
      <div *ngFor="let target of targets; let i = index" [formGroup]="targetsForm.at(i)" class="inline-fields">
        <mat-form-field class="target-code" appearance="outline">
          <mat-label>{{ targetTypesMap[target.type].label }}</mat-label>
          <mat-select formControlName="code" required #code>
            <mat-option *ngFor="let opt of targetOptionsMap[target.type]" [value]="opt.code">{{ opt.label }}</mat-option>
          </mat-select>
        </mat-form-field>
        <div class="target-exclude mat-form-field-wrapper">
          <mat-checkbox formControlName="exclude">Exclude</mat-checkbox>
        </div>
        <div class="remove-target mat-form-field-wrapper">
          <button mat-icon-button aria-label="Remove target" (click)="onRemoveTarget(i)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
      <div class="add-target">
        <button mat-button color="primary" [matMenuTriggerFor]="addTargetMenu"><mat-icon>add</mat-icon> Add a target</button>
        <mat-menu #addTargetMenu="matMenu" xPosition="after">
          <button mat-menu-item *ngFor="let type of targetTypes" (click)="onAddTarget(type.type)">{{ type.label }}</button>
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
export class FlightTargetsFormComponent implements ControlValueAccessor, OnDestroy {
  // tslint:disable-next-line
  private _targetOptionsMap: InventoryTargetsMap;
  get targetOptionsMap() {
    return this._targetOptionsMap;
  }
  @Input()
  set targetOptionsMap(targetOptionsMap: InventoryTargetsMap) {
    this._targetOptionsMap = targetOptionsMap && {
      ...targetOptionsMap,
      ...(targetOptionsMap.episode && {
        episode: targetOptionsMap.episode.sort(this.compareEpisodes).map(this.formatEpisodeLabel)
      })
    };
  }
  @Input() targetTypes: InventoryTargetType[];

  targets: { type: string }[] = [];
  targetsForm: FormArray;
  targetsFormSub: Subscription;
  onChangeFn = (value: any) => {};
  onTouchedFn = (value: any) => {};

  ngOnDestroy() {
    this.unsubscribeFromTargetsForm();
  }

  get ready() {
    return !!this.targetOptionsMap && this.targetTypes;
  }

  get targetTypesMap(): { [k: string]: InventoryTargetType } {
    return this.targetTypes.reduce(
      (a, type) => ({
        ...a,
        [type.type]: type
      }),
      {}
    );
  }

  flightTargetFormGroup(target: FlightTarget): FormGroup {
    const { code, exclude } = target;
    return new FormGroup({
      code: new FormControl(code, Validators.required),
      exclude: new FormControl(exclude || false)
    });
  }

  writeValue(targets: FlightTarget[]) {
    // TODO: This check is here to prevent an error seen in tests. Determine if
    // there is something in the spec that could be done differently to not
    // require this check.
    if (Array.isArray(targets)) {
      // Clean up subscriptions and previous form groups.
      if (this.targetsFormSub) {
        this.unsubscribeFromTargetsForm();
        this.targetsForm.clear();
      }

      // Build our array of static target prop values.
      this.targets = targets.map(({ type }) => ({ type }));
      // Create form groups for editable target prop values.
      const formGroups = [];
      targets.forEach((target: FlightTarget) => {
        formGroups.push(this.flightTargetFormGroup(target));
      });
      this.targetsForm = new FormArray(formGroups);
      // Create new subscription for form changes.
      this.targetsFormSub = this.targetsForm.valueChanges.subscribe(formTargets => {
        // Combine static values with form values.
        const changes = formTargets.map((group, i: number) => ({
          type: this.targets[i].type,
          code: group.code,
          exclude: group.exclude
        }));

        // Pass on changes if all targets have codes.
        this.onChangeFn(changes);
      });
    }
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: (value: any) => void) {
    this.onTouchedFn = fn;
  }

  validate() {
    return !this.targetsForm || this.targetsForm.valid ? null : { error: 'Invalid targets' };
  }

  onAddTarget(type: string) {
    // Append object with target static prop values to targets array.
    if (!this.targets) {
      // Make sure targets is an array.
      this.targets = [];
    }
    this.targets.push({
      type
    });

    // Append new form group to targets form array.
    const formGroup = this.flightTargetFormGroup({ type, code: '', exclude: false });
    if (!this.targetsForm) {
      // Make sure targetsForm is a form array.
      this.targetsForm = new FormArray([]);
    }
    this.targetsForm.push(formGroup);
  }

  onRemoveTarget(index: number) {
    // Remove static values object.
    this.targets.splice(index, 1);
    // Remove form group.
    this.targetsForm.removeAt(index);
  }

  private unsubscribeFromTargetsForm() {
    if (this.targetsFormSub) {
      this.targetsFormSub.unsubscribe();
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
