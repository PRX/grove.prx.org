import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../shared/shared.module';

import { MockHalService } from 'ngx-prx-styleguide';
import { CampaignListService } from '../campaign-list/campaign-list.service';
import { CampaignListModule } from '../campaign-list/campaign-list.module';
import { CampaignListServiceMock, params } from '../campaign-list/campaign-list.service.mock';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let comp: HomeComponent;
  let fix: ComponentFixture<HomeComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockCampaignListService = new CampaignListServiceMock(mockHal);
  const { per, ...routableParams } = params;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        NoopAnimationsModule,
        CampaignListModule
      ],
      declarations: [
        HomeComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({...routableParams, before: params.before.toISOString(), after: params.after.toISOString()})
          }
        },
        {
          provide: CampaignListService,
          useValue: mockCampaignListService
        }
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(HomeComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;
      fix.detectChanges();
    });
  }));

  it('map route params to campaign params', (done) => {
    comp.params$.subscribe(campaignParams => {
      expect(campaignParams).toEqual(routableParams);
      done();
    });
  });
});
