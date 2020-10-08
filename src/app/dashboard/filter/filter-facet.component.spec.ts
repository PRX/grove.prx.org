import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { facets } from '../dashboard.service.mock';
import { FilterFacetComponent } from '.';

describe('FilterFacetComponent', () => {
  let comp: FilterFacetComponent;
  let fix: ComponentFixture<FilterFacetComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatFormFieldModule, MatInputModule, MatSelectModule, NoopAnimationsModule],
      declarations: [FilterFacetComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(FilterFacetComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        fix.detectChanges();
        spyOn(comp.selectedOptionsChange, 'emit');
      });
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should emit value on change', () => {
    comp.options = facets.status;
    comp.selectedOptions = facets.status[0].id;
    fix.detectChanges();
    expect(comp.selectedOptionsChange.emit).toHaveBeenCalledWith(facets.status[0].id);
  });

  it('should emit numeric types', () => {
    comp.options = facets.podcast;
    comp.selectedOptions = facets.podcast[0].id;
    fix.detectChanges();
    expect(typeof facets.podcast[0].id).toEqual('number');
    expect(comp.selectedOptionsChange.emit).toHaveBeenCalledWith(facets.podcast[0].id);
  });

  it('should emit string types', () => {
    comp.options = facets.podcast;
    comp.selectedOptions = facets.type[0].id;
    fix.detectChanges();
    expect(typeof facets.type[0].id).toEqual('string');
    expect(comp.selectedOptionsChange.emit).toHaveBeenCalledWith(facets.type[0].id);
  });
});
