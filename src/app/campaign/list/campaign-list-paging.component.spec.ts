import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { CampaignListPagingComponent } from './campaign-list-paging.component';

describe('CampaignListPagingComponent', () => {
  let comp: CampaignListPagingComponent;
  let fix: ComponentFixture<CampaignListPagingComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CampaignListPagingComponent
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(CampaignListPagingComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;

      comp.totalPages = 12;
      comp.currentPage = 7;
      fix.detectChanges();
    });
  }));

  it('should show paging buttons', () => {
    const buttons = de.queryAll(By.css('button.pager'));
    expect(buttons.length).toEqual(12 + 4); // first, prev, totalPages, next, last
    expect(buttons[2].nativeElement.textContent).toContain('1'); // page 1
  });
});
