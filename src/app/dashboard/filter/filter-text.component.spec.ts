import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FilterTextComponent } from '.';

describe('FilterTextComponent', () => {
  let comp: FilterTextComponent;
  let fix: ComponentFixture<FilterTextComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatFormFieldModule, MatInputModule, NoopAnimationsModule],
      declarations: [FilterTextComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(FilterTextComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        fix.detectChanges();
        spyOn(comp.search, 'emit');
      });
  }));

  it('should emit search text', done => {
    const str = 'search string';
    comp.searchOutput$.subscribe(() => {
      expect(comp.search.emit).toHaveBeenCalledWith(str);
      done();
    });
    comp.onChange(str);
  });
});
