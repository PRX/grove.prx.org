import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { MockHalService, PagingModule } from 'ngx-prx-styleguide';
import { SharedModule } from '../../shared/shared.module';

import { CampaignListService } from '../campaign-list.service';
import { CampaignListServiceMock, campaigns as campaignsFixture, params } from '../campaign-list.service.mock';
import {
  CampaignListComponent,
  CampaignListTotalPagesPipe,
  CampaignFilterComponent,
  FilterFacetComponent,
  FilterTextComponent } from './';
import {
  CampaignCardComponent,
  CampaignFlightDatesPipe,
  CampaignFlightTargetsPipe,
  CampaignFlightZonesPipe,
  CampaignTypePipe } from '../card/';

describe('CampaignListComponent', () => {
  let comp: CampaignListComponent;
  let fix: ComponentFixture<CampaignListComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockCampaignListService = new CampaignListServiceMock(mockHal);
  let campaignListService: CampaignListService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        PagingModule,
        SharedModule
      ],
      declarations: [
        CampaignCardComponent,
        CampaignFlightDatesPipe,
        CampaignFlightTargetsPipe,
        CampaignFlightZonesPipe,
        CampaignTypePipe,
        CampaignListComponent,
        CampaignListTotalPagesPipe,
        CampaignFilterComponent,
        FilterFacetComponent,
        FilterTextComponent
      ],
      providers: [
        {
          provide: CampaignListService,
          useValue: mockCampaignListService
        }
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(CampaignListComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;
      campaignListService = TestBed.get(CampaignListService);
      fix.detectChanges();
    });
  }));

  it('should show page 1 of campaigns', () => {
    expect(de.query(By.css('prx-paging'))).toBeDefined();
    expect(de.query(By.css('prx-paging button.paging.active')).nativeElement.textContent).toMatch('1');
    expect(de.queryAll(By.css('grove-campaign-card')).length).toEqual(campaignsFixture.length);
  });

  it('should route to params on page change', () => {
    jest.spyOn(comp, 'routeToParams');
    const buttons = de.queryAll(By.css('prx-paging button'));
    for (const button of buttons) {
      if (button.nativeElement.textContent === '2') {
        button.nativeElement.click();
        break;
      }
    }
    expect(comp.routeToParams).toHaveBeenCalledWith({page: 2});
  });

  it('should load campaign list on params change', () => {
    jest.spyOn(campaignListService, 'loadCampaignList');
    comp.routedParams = params;
    fix.detectChanges();
    comp.ngOnChanges();
    expect(campaignListService.loadCampaignList).toHaveBeenCalledWith(params);
  });
});
