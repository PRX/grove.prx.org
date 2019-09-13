import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';

import { facets } from '../campaign-list.service.mock';

import {
  CampaignFilterComponent,
  FilterFacetComponent,
  FilterTextComponent,
  FilterDateComponent } from './';

describe('CampaignFilterComponent', () => {
  let comp: CampaignFilterComponent;
  let fix: ComponentFixture<CampaignFilterComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule
      ],
      declarations: [
        CampaignFilterComponent,
        FilterFacetComponent,
        FilterTextComponent,
        FilterDateComponent
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(CampaignFilterComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;
      comp.facets = facets;
      comp.params = {page: 1, per: 2};
      fix.detectChanges();
    });
  }));

  it ('should ', () => {
    // component is just a wrapper
  });
});
