import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, Validators, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormControl } from '@angular/forms';
import { InventoryTargets, InventoryTarget, FlightTarget, InventoryTargetType, InventoryTargetsMap } from '../store/models';
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
    </fieldset>
    <div class="add-target">
      <button mat-button color="primary" [matMenuTriggerFor]="addTargetMenu"><mat-icon>add</mat-icon> Add a target</button>
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
export class FlightTargetsFormComponent implements ControlValueAccessor {
  // tslint:disable-next-line
  private _targetOptions: InventoryTargets;
  get targetOptions() {
    return this._targetOptions;
  }
  @Input()
  set targetOptions(targetOptions: InventoryTargets) {
    this._targetOptions = targetOptions;
    // this.setCodeOptions(this.targets ? (this.targets.value as FlightTarget[]) : []);
  }
  @Input() flightTargets: FlightTarget[];
  @Input() targetTypes: InventoryTargetType[];
  @Input() targetOptionsMap: InventoryTargetsMap;
  @Output() addTarget = new EventEmitter<{ target: FlightTarget }>();
  @Output() removeTarget = new EventEmitter<{ index: number }>();

  targets: { type: string }[] = [];
  targetsForm: FormArray;
  targetsFormSub: Subscription;
  onChangeFn = (value: any) => {};
  onTouchedFn = (value: any) => {};

  get ready() {
    return !!this.targets.length && !!this.targetOptionsMap;
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

  newFlightTarget(target: FlightTarget) {
    return new FormGroup({
      type: new FormControl(target.type, Validators.required),
      code: new FormControl(target.code, Validators.required),
      exclude: new FormControl(target.exclude || false)
    });
  }

  flightTargetFormGroup(target: FlightTarget): FormGroup {
    const { code, exclude } = target;
    return new FormGroup({
      code: new FormControl(code, Validators.required),
      exclude: new FormControl(exclude || false)
    });
  }

  writeValue(targets: FlightTarget[]) {
    // this.setCodeOptions(targets);
    // this.targets = new FormArray((targets || []).map(this.newFlightTarget));
    // // TODO: wouldn't this be leaking subscriptions? Instead of new'ing the FormArray and subscribing on each update,
    // //  it should update/add/remove the controls in the array
    // this.targets.valueChanges.subscribe(formTargets => {
    //   this.setCodeOptions(formTargets);
    //   this.onChangeFn(this.validTargetCodes(formTargets));
    // });

    console.log('writeValue >> targets', targets);

    // // get the correct number of zone fields and patchValue
    // const expectedLength = targets.length;
    // while (this.targets.controls.length > expectedLength) {
    //   this.targets.removeAt(this.targets.controls.length - 1);
    //   this.targets.markAsPristine();
    // }
    // const addZones = [...targets];
    // while (this.targets.controls.length < expectedLength) {
    //   // this only adds controls, doesn't reset controls already in form
    //   this.targets.push(this.flightTargetFormGroup(targets && addZones.pop()));
    //   this.targets.markAsPristine();
    // }
    // // patch all of the values onto the FormArray
    // this.targets.patchValue(targets || [], { emitEvent: false });

    if (Array.isArray(targets)) {
      // Clean up subscriptions.
      if (this.targetsFormSub) {
        this.targetsFormSub.unsubscribe();
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
        let hasEmptyCode = false;

        console.log('targetsSub >> targets', this.targets);

        // Combine static values with form values.
        const changes = formTargets.map((group, i: number) => ({
          type: this.targets[i].type,
          code: group.code,
          exclude: group.exclude
        }));

        changes.forEach(({ code }: FlightTarget) => (hasEmptyCode = !code));

        console.log('targetsSub >> changes', changes);

        // Pass on changes.
        if (!hasEmptyCode) {
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

  onAddTarget(type: string) {
    const newTarget = { type, code: '', exclude: false };
    let newIndex: number;

    console.log('onAddTarget >> type', type);

    if (!this.targets) {
      this.targets = [];
    }

    newIndex = this.targets.length;
    const formGroup = this.flightTargetFormGroup(newTarget);
    this.targets.push({
      type
    });
    this.targetsForm.push(formGroup);

    console.log('onAddTarget >> targets', this.targets);
    // this.addTarget.emit({ target: newTarget });
  }

  onRemoveTarget(index: number) {
    this.targetsForm.removeAt(index);
    this.targets.splice(index, 1);
    this.targetsForm.updateValueAndValidity();
    // this.removeTarget.emit({ index });
  }

  // private validTargetCodes(targets: FlightTarget[]) {
  //   return targets.filter(({ type, code }, index) => {
  //     if (!type || !code) {
  //       return false;
  //     } else if (!this.codeOptions[index].find(opt => opt.code === code)) {
  //       // the type changed, and now the code is stale ... clear it!
  //       this.targets
  //         .at(index)
  //         .get('code')
  //         .setValue('');
  //       return false;
  //     } else {
  //       return true;
  //     }
  //   });
  // }

  // private setCodeOptions(targets: FlightTarget[]) {
  //   this.codeOptions = (targets || []).map(target => {
  //     return this.filteredTargetOptions(target.type, target.code, targets);
  //   });
  // }

  // private filteredTargetOptions(type: string, code: string, currentTargets: FlightTarget[]) {
  //   return this.targetCodesForType(type).filter(opt => {
  //     if (opt.type === type && opt.code === code) {
  //       return true;
  //     } else {
  //       return !currentTargets.find(t => opt.type === t.type && opt.code === t.code);
  //     }
  //   });
  // }

  // private targetCodesForType(type: string) {
  //   if (this.targetOptions && type === 'episode') {
  //     return this.targetOptions.episodes.sort(this.compareEpisodes).map(this.formatEpisodeLabel);
  //   } else if (this.targetOptions && type === 'country') {
  //     return this.targetOptions.countries.sort((a, b) => a.label.localeCompare(b.label));
  //   } else {
  //     return [];
  //   }
  // }

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
