import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';

import { facets } from '../campaign-list.service.mock';
import { FilterFacetComponent } from '.';

describe('FilterFacetComponent', () => {
  let comp: FilterFacetComponent;
  let fix: ComponentFixture<FilterFacetComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule
      ],
      declarations: [
        FilterFacetComponent
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(FilterFacetComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;
      fix.detectChanges();
      spyOn(comp.selectOption, 'emit');
    });
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  it ('should emit value on change', () => {
    comp.options = facets.status;
    comp.selectedOption = facets.status[0].id;
    fix.detectChanges();
    comp.onChange('canceled');
    expect(comp.selectOption.emit).toHaveBeenCalledWith('canceled');
  });

  it ('should emit parsed value for numeric types', () => {
    comp.options = facets.podcast;
    comp.selectedOption = facets.podcast[0].id;
    fix.detectChanges();
    comp.onChange('2');
    expect(comp.selectOption.emit).toHaveBeenCalledWith(2);
  });
});
