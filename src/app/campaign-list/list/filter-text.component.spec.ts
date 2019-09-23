import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule, MatInputModule } from '@angular/material';

import { SharedModule } from '../../shared/shared.module';

import { FilterTextComponent } from '.';

describe('FilterTextComponent', () => {
  let comp: FilterTextComponent;
  let fix: ComponentFixture<FilterTextComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule
      ],
      declarations: [
        FilterTextComponent
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(FilterTextComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;
      fix.detectChanges();
      spyOn(comp.search, 'emit');
    });
  }));

  it ('should emit search text', (done) => {
    const str = 'search string';
    comp.searchOutput$.subscribe(() => {
      expect(comp.search.emit).toHaveBeenCalledWith(str);
      done();
    });
    comp.onChange(str);
  });
});
