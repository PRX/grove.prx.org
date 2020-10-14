import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FlightTargetsFormComponent } from './flight-targets-form.component';
import { InventoryTargetsMap, InventoryTargetType } from '../store/models';

@Component({
  template: `
    <form [formGroup]="flightForm">
      <grove-flight-targets #childForm formControlName="targets" [targetTypes]="targetTypes" [targetOptionsMap]="optionsMap">
      </grove-flight-targets>
    </form>
  `
})
class ParentFormComponent {
  @ViewChild('childForm', { static: true }) childForm: FlightTargetsFormComponent;
  constructor(private fb: FormBuilder) {}
  flightForm = this.fb.group({ targets: [''] });
  optionsMap: InventoryTargetsMap = {
    country: [
      { type: 'country', code: 'US', label: 'The Us' },
      { type: 'country', code: 'CA', label: 'The Canadia' }
    ],
    episode: [{ type: 'episode', code: 'AAAA', label: 'The Episoded' }]
  };
  targetTypes: InventoryTargetType[] = [{ type: 'country', label: 'Country', labelPlural: 'Countries' }];
}

describe('FlightTargetsFormComponent', () => {
  let parent: ParentFormComponent;
  let component: FlightTargetsFormComponent;
  let fixture: ComponentFixture<ParentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule
      ],
      declarations: [ParentFormComponent, FlightTargetsFormComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentFormComponent);
    parent = fixture.componentInstance;
    component = parent.childForm;
    fixture.detectChanges();
  });

  it("return a target type's label", () => {
    const label = component.getTargetTypeLabel('country');
    const labelPlural = component.getTargetTypeLabel('country', true);

    expect(label).toBe('Country');
    expect(labelPlural).toBe('Countries');
  });

  it('sets targets from the parent form', () => {
    expect(component.targetsForm).toBeUndefined();
    parent.flightForm.setValue({ targets: [{}] });
    expect(component.targetsForm.length).toEqual(1);
    parent.flightForm.reset({ targets: [{}, {}] });
    expect(component.targetsForm.length).toEqual(2);
  });

  it('adds empty target of a specific types', () => {
    component.onAddTarget('country');
    expect(component.targets).toBeDefined();
    expect(component.targets.length).toBe(1);
    expect(component.targets[0].type).toBe('country');
    expect(component.targetsForm).toBeDefined();
    expect(component.targetsForm.length).toEqual(1);
    expect(component.targetsForm.at(0).get('code')).toBeDefined();
    expect(component.targetsForm.at(0).get('code').value).toBe('');
    expect(component.targetsForm.at(0).get('exclude')).toBeDefined();
    expect(component.targetsForm.at(0).get('exclude').value).toBe(false);
    expect(component.targetsForm.valid).toBe(false);
  });

  it('becomes valid when target code is selected', () => {
    component.onAddTarget('country');
    component.targetsForm
      .at(0)
      .get('code')
      .setValue('CA');
    expect(component.targetsForm.at(0).get('code').value).toBe('CA');
    expect(component.targetsForm.valid).toBe(true);
  });

  it('removes targets', () => {
    parent.flightForm.reset({
      targets: [
        { type: 'country', code: 'US', exclude: false },
        { type: 'episode', code: 'AAAA', exclude: false }
      ]
    });
    expect(parent.flightForm.dirty).toEqual(false);
    expect(component.targetsForm.length).toBe(2);
    expect(component.targetsForm.at(0).get('code').value).toBe('US');

    component.onRemoveTarget(0);
    expect(component.targets.length).toBe(1);
    expect(component.targetsForm.length).toBe(1);
    expect(component.targetsForm.at(0).get('code').value).toBe('AAAA');
  });

  it('validates targets', () => {
    expect(parent.flightForm.valid).toEqual(true);

    component.onAddTarget('country');
    expect(component.targetsForm.valid).toEqual(false);

    component.targetsForm.at(0).setValue({ code: '', exclude: false });
    expect(component.targetsForm.valid).toEqual(false);

    component.targetsForm.at(0).setValue({ code: 'US', exclude: false });
    expect(component.targetsForm.valid).toEqual(true);
  });

  it('sorts episode options by publish date', () => {
    component.targetOptionsMap = {
      episode: [
        { type: 'episode', code: 'A', label: 'Ep A', metadata: { publishedAt: '2020-02-12T00:00:00.000Z' } },
        { type: 'episode', code: 'B', label: 'Ep B', metadata: { releasedAt: '2020-01-22T00:00:00.000Z' } },
        { type: 'episode', code: 'C', label: 'Ep C', metadata: { publishedAt: '2020-02-02T00:00:00.000Z' } },
        { type: 'episode', code: 'D', label: 'Ep D', metadata: { publishedAt: '2020-02-22T00:00:00.000Z' } }
      ]
    };
    expect(component.targetOptionsMap.episode.map(o => o.code)).toEqual(['D', 'A', 'C', 'B']);
  });

  it('prepends date string to episode options label', () => {
    component.targetOptionsMap = {
      episode: [{ type: 'episode', code: 'A', label: 'Ep A', metadata: { publishedAt: '2020-02-12T00:00:00.000Z' } }]
    };
    expect(component.targetOptionsMap.episode[0].label).toEqual('2/12/2020 - Ep A');
  });

  it('does not emit while receiving incoming update', () => {
    jest.spyOn(component, 'onChangeFn');
    component.writeValue([{ type: 'country', code: 'US', exclude: false }]);
    expect(component.onChangeFn).not.toHaveBeenCalled();
  });
});
