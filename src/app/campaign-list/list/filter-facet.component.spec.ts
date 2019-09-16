import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule } from '@angular/material';

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
        SharedModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule
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
      spyOn(comp.selectedOptionsChange, 'emit');
    });
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  it ('should emit value on change', () => {
    comp.options = facets.status;
    comp.selectedOptions = facets.status[0].id;
    fix.detectChanges();
    expect(comp.selectedOptionsChange.emit).toHaveBeenCalledWith(facets.status[0].id);
  });

  it ('should emit numeric types', () => {
    comp.options = facets.podcast;
    comp.selectedOptions = facets.podcast[0].id;
    fix.detectChanges();
    expect(typeof facets.podcast[0].id).toEqual('number');
    expect(comp.selectedOptionsChange.emit).toHaveBeenCalledWith(facets.podcast[0].id);
  });

  it ('should emit string types', () => {
    comp.options = facets.podcast;
    comp.selectedOptions = facets.type[0].id;
    fix.detectChanges();
    expect(typeof facets.type[0].id).toEqual('string');
    expect(comp.selectedOptionsChange.emit).toHaveBeenCalledWith(facets.type[0].id);
  });
});