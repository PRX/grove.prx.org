import { Component, Input, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormArray,
  Validators,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
  FormControl,
  AbstractControl
} from '@angular/forms';
import { InventoryTarget, FlightTarget, InventoryTargetType, InventoryTargetsMap } from '../store/models';
import moment from 'moment';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'grove-flight-targets',
  template: `
    <fieldset *ngIf="ready">
      <div *ngFor="let target of targets; let i = index" [formGroup]="targetsForm.at(i)" class="inline-fields">
        <mat-form-field class="target-code" appearance="outline">
          <mat-label>{{ getTargetTypeLabel(target.type) }}</mat-label>
          <input matInput type="text" formControlName="code" [matAutocomplete]="code" />
          <mat-autocomplete #code="matAutocomplete" [displayWith]="displayCodeLabel(target.type)">
            <mat-option *ngFor="let opt of target.options$ | async" [value]="opt.code">{{ opt.label }}</mat-option>
          </mat-autocomplete>
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
    </fieldset>
    <div class="add-target">
      <button mat-button color="primary" [matMenuTriggerFor]="addTargetMenu" [disabled]="!ready">
        <mat-icon>add</mat-icon> Add a target
      </button>
      <mat-menu #addTargetMenu="matMenu" xPosition="after">
        <button mat-menu-item *ngFor="let type of targetTypes" (click)="onAddTarget(type.type)">{{ type.label }}</button>
      </mat-menu>
    </div>
  `,
  styleUrls: ['flight-targets-form.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: FlightTargetsFormComponent, multi: true },
    { provide: NG_VALIDATORS, useExisting: FlightTargetsFormComponent, multi: true }
  ]
})
export class FlightTargetsFormComponent implements ControlValueAccessor, OnDestroy {
  private targetsCodeMap: { [k: string]: FlightTarget };
  private targetTypesMap: { [k: string]: InventoryTargetType };
  // tslint:disable-next-line
  private _targetOptionsMap: InventoryTargetsMap;
  get targetOptionsMap() {
    return this._targetOptionsMap;
  }
  @Input()
  set targetOptionsMap(targetOptionsMap: InventoryTargetsMap) {
    // Update atarget options for dropdowns.
    this._targetOptionsMap = targetOptionsMap && {
      ...targetOptionsMap,
      // Update episode targets.
      ...(targetOptionsMap.episode && {
        episode: targetOptionsMap.episode.sort(this.compareEpisodes).map(this.formatEpisodeLabel)
      })
    };

    // Create map to look up targets by type and code. Seems crazy, but we need
    // it to provide a label inplace of the selected code.
    this.targetsCodeMap =
      this._targetOptionsMap &&
      Object.entries(this._targetOptionsMap).reduce(
        (a, [key, targets]) => ({
          ...a,
          [key]: targets.reduce(
            (b, target) => ({
              ...b,
              [target.code]: target
            }),
            {}
          )
        }),
        {}
      );
  }
  // tslint:disable-next-line
  private _targetTypes: InventoryTargetType[];
  @Input()
  set targetTypes(targetTypes: InventoryTargetType[]) {
    this._targetTypes = targetTypes;
    this.targetTypesMap =
      targetTypes &&
      targetTypes.reduce(
        (a, type) => ({
          ...a,
          [type.type]: type
        }),
        {}
      );
  }
  get targetTypes() {
    return this._targetTypes;
  }

  targets: { type: string; options$: Observable<InventoryTarget[]> }[] = [];
  targetsForm: FormArray;
  targetsFormSub: Subscription;
  emitGuard = false;
  onChangeFn = (value: any) => {};
  onTouchedFn = (value: any) => {};

  /**
   * Determine if the form is ready to render.
   */
  get ready(): boolean {
    return (!this.targetsForm || this.targets.length === this.targetsForm.length) && !!this.targetOptionsMap && !!this.targetTypes;
  }

  ngOnDestroy() {
    this.unsubscribeFromTargetsForm();
  }

  writeValue(targets: FlightTarget[]) {
    // TODO: This check is here to prevent an error seen in tests. Determine if
    // there is something in the spec that could be done differently to not
    // require this check.
    if (Array.isArray(targets)) {
      // don't emit while manipulating FormArray with incoming update
      this.emitGuard = true;
      // Clean up subscriptions and previous form groups.
      if (this.targetsFormSub) {
        this.unsubscribeFromTargetsForm();
        this.targetsForm.clear();
        this.targets = [];
      }

      // Create form groups for editable target prop values.
      const formGroups = [];
      targets.forEach((target: FlightTarget) => {
        const formGroup = this.flightTargetFormGroup(target);
        this.addTarget(target, formGroup.get('code'));
        formGroups.push(formGroup);
      });
      this.targetsForm = new FormArray(formGroups);
      this.emitGuard = false;
      // Create new subscription for form changes.
      this.targetsFormSub = this.targetsForm.valueChanges.subscribe(formTargets => {
        const changes = formTargets.map(this.flightTargetOutput.bind(this));
        if (!this.emitGuard) {
          this.onChangeFn(changes);
        }
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

  /**
   * Return the label for a target type.
   * @param type Type name to get label for.
   * @param isPlural Flag to return plural label, if available.
   */
  getTargetTypeLabel(type: string, isPlural: boolean = false): string {
    return (isPlural && this.targetTypesMap[type].labelPlural) || this.targetTypesMap[type].label;
  }

  /**
   * Generate form group controls for a flight target.
   * @param target Flight target object.
   */
  flightTargetFormGroup(target: FlightTarget): FormGroup {
    const { code, exclude } = target;
    return new FormGroup({
      code: new FormControl(code, Validators.required),
      exclude: new FormControl(exclude || false)
    });
  }

  /**
   * Add flight target form controls.
   * @param target Flight target object.
   */
  addFlightTargetFormGroup(target: FlightTarget) {
    if (!this.targetsForm) {
      // Make sure targetsForm is a form array.
      this.targetsForm = new FormArray([]);
    }
    // Append new form group to targets form array.
    const formGroup = this.flightTargetFormGroup(target);
    this.addTarget(target, formGroup.get('code'));
    this.targetsForm.push(formGroup);
  }

  /**
   * Click handler to add target of a specified type.
   * @param type Type of target to add.
   */
  onAddTarget(type: string) {
    const newTarget = { type, code: '', exclude: false };
    this.addFlightTargetFormGroup(newTarget);
  }

  /**
   * Click handler to removal of a target.
   * @param index Where in the array to remove target.
   */
  onRemoveTarget(index: number) {
    // Remove static values object.
    this.targets.splice(index, 1);
    // Remove form group.
    this.targetsForm.removeAt(index);
  }

  /**
   * Generate a display callback function for selected autocomplete panel options.
   *
   * @param type Target type of set to selected code can be found on.
   * @return Callback function that return a string.
   */
  displayCodeLabel(type: string) {
    return (code: string) => {
      const label =
        code && this.targetsCodeMap[type] && this.targetsCodeMap[type][code] ? this.targetsCodeMap[type][code].label : undefined;
      return label;
    };
  }

  /**
   * Add item to targets to coordinate values outside form controls.
   *
   * @param target Target object to get static values from.
   * @param formControl Form control that is used to filter available options.
   */
  private addTarget({ type }: InventoryTarget | FlightTarget, formControl: AbstractControl) {
    // Append object with target static prop values to targets array.
    if (!this.targets) {
      // Make sure targets is an array.
      this.targets = [];
    }
    this.targets.push({
      type,
      options$: formControl.valueChanges.pipe(
        startWith(''),
        map(value => (typeof value === 'string' ? value : value.label)),
        map(label => (label ? this.filterTargetsByLabel(type, label) : this.targetOptionsMap[type]))
      )
    });
  }

  /**
   * Unsubscribe from form array  changes.
   */
  private unsubscribeFromTargetsForm() {
    if (this.targetsFormSub) {
      this.targetsFormSub.unsubscribe();
    }
  }

  /**
   * Sort function to sort targets by date (descending).
   *
   * @param a Inventory target object.
   * @param b Inventory target object.
   */
  private compareEpisodes(a: InventoryTarget, b: InventoryTarget) {
    const apub = a.metadata ? a.metadata.publishedAt || a.metadata.releasedAt : null;
    const bpub = b.metadata ? b.metadata.publishedAt || b.metadata.releasedAt : null;
    if (apub && bpub) {
      return bpub.localeCompare(apub);
    } else {
      return a.label.localeCompare(b.label);
    }
  }

  /**
   * Prepend date to label, when possible.
   * @param t Inventory target object.
   */
  private formatEpisodeLabel(t: InventoryTarget) {
    const pub = t.metadata ? t.metadata.publishedAt || t.metadata.releasedAt : null;
    if (pub) {
      const date = moment(pub)
        .utc()
        .format('l');
      return { ...t, label: `${date} - ${t.label}` };
    } else {
      return t;
    }
  }

  /**
   * Filter a set of target options by label content.
   * @param type Target type whose options to query.
   * @param query Value to query target label for.
   */
  private filterTargetsByLabel(type: string, query: string): InventoryTarget[] {
    const filterValue = query.toLowerCase();
    const canFilter = !!(this.targetOptionsMap && this.targetOptionsMap[type]);
    const result = canFilter
      ? this.targetOptionsMap[type].filter(({ label = '' }: InventoryTarget) => label.toLowerCase().indexOf(filterValue) > -1)
      : [];

    return result;
  }

  /**
   * Provide a output ready target object to include in values sent to onChangeFn.
   * @param group Target form values passed into a subscription handler.
   * @param i Index of the form group in the array.
   */
  private flightTargetOutput(group: { code: string; exclude: boolean }, i: number) {
    const type = this.targets[i].type;
    // Only preserve code if exists on a target option. This will prevent autocomplete "search" values from dirtying up the form state.
    const code = this.targetsCodeMap[type] && this.targetsCodeMap[type][group.code] ? group.code : null;

    return {
      ...group,
      type,
      code
    };
  }
}
