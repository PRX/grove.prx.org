import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import { MockHalService } from 'ngx-prx-styleguide';

import { DashboardService } from './dashboard.service';
import { DashboardServiceMock } from './dashboard.service.mock';

import { DashboardComponent } from './dashboard.component';
import { DashboardFilterComponent, FilterFacetComponent, FilterTextComponent, FilterDateComponent } from './filter';
import { CampaignListSortComponent } from './campaign-list/';

describe('DashboardComponent', () => {
  let comp: DashboardComponent;
  let fix: ComponentFixture<DashboardComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockDashboardService = new DashboardServiceMock(mockHal);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        MatSelectModule,
        MatTabsModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      declarations: [
        DashboardComponent,
        DashboardFilterComponent,
        FilterFacetComponent,
        FilterTextComponent,
        FilterDateComponent,
        CampaignListSortComponent
      ],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(DashboardComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        el = de.nativeElement;
        fix.detectChanges();
      });
  }));

  it('flights and campaigns tabs link to page 1', () => {
    const tabs = de.queryAll(By.css('a.mat-tab-link'));
    expect(tabs.length).toEqual(2);
    expect(tabs[0].nativeElement.textContent).toContain('Flights');
    expect(tabs[0].nativeElement.href).toContain('page=1');
    expect(tabs[1].nativeElement.textContent).toContain('Campaigns');
    expect(tabs[1].nativeElement.href).toContain('page=1');
  });
});
