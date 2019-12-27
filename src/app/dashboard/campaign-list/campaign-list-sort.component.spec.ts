import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { CampaignListSortComponent } from './campaign-list-sort.component';

describe('CampaignListSortComponent', () => {
  let comp: CampaignListSortComponent;
  let fix: ComponentFixture<CampaignListSortComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CampaignListSortComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CampaignListSortComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
      });
  }));

  it('should change direction true or false', () => {
    jest.spyOn(comp.changeDirection, 'emit');
    comp.direction = false;
    fix.detectChanges();
    const toggle = de.query(By.css('input.updown-toggle'));
    toggle.nativeElement.click();
    expect(toggle.nativeElement.checked).toBeTruthy();
    expect(comp.changeDirection.emit).toHaveBeenCalledWith(true);

    comp.direction = true;
    fix.detectChanges();
    toggle.nativeElement.click();
    expect(toggle.nativeElement.checked).toBeFalsy();
    expect(comp.changeDirection.emit).toHaveBeenCalledWith(false);
  });
});
