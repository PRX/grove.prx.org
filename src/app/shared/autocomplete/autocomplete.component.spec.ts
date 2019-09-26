import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

import { AutocompleteComponent } from './autocomplete.component';

describe('AutocompleteComponent', () => {
  let comp: AutocompleteComponent;
  let fix: ComponentFixture<AutocompleteComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ],
      declarations: [
        AutocompleteComponent
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(AutocompleteComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;

      comp.formGroup = new FormGroup({set_advertiser_uri: new FormControl()});
      comp.controlName = 'set_advertiser_uri';
      comp.label = 'Advertiser';
      comp.options = [{name: 'Toyoda', value: '/url/toyoda'}, {name: 'Roundspot', value: '/url/roundspot'}];
      fix.detectChanges();
    });
  }));

  it('filters options', done => {
    // at first the list isn't filtered
    let filtered = false;
    comp.filteredOptions$.subscribe(options => {
      expect(options.find(opt => opt.name.indexOf('Toy') > -1)).toBeDefined();
      if (filtered) {
        expect(options.length).toEqual(1);
        done();
      } else {
        expect(options.length).toEqual(comp.options.length);
      }
    });
    // a filter of 'Toy' is entered
    filtered = true;
    const input = de.query(By.css('input')).nativeElement;
    input.value = 'Toy';
    input.dispatchEvent(new Event('input'));
  });

  it('displays with option name', () => {
    expect(comp.optionName('/url/toyoda')).toEqual('Toyoda');
  });

  it('finds existing options by name', () => {
    expect(comp.findExistingOtion('Toyoda')).toBeDefined();
  });

  it('emits for new options', () => {
    jest.spyOn(comp.addOption, 'emit');
    comp.addNewOption('Squarespace');
    expect(comp.addOption.emit).toHaveBeenCalled();
  });

  it('submits on enter', () => {
    jest.spyOn(comp, 'addNewOption');
    comp.formGroup.get(comp.controlName).setValue('Toy Land');
    comp.enterPressed(new Event('keydown.enter'));
    expect(comp.addNewOption).toHaveBeenCalled();
  });
});
