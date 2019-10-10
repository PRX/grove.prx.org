import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement, Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { MockHalService } from 'ngx-prx-styleguide';
import { CampaignListService, CampaignParams } from '../campaign-list/campaign-list.service';
import { CampaignListServiceMock, params } from '../campaign-list/campaign-list.service.mock';
import { HomeComponent } from './home.component';

@Component({
  selector: 'grove-campaign-list',
  template: ``
})
class MockGroveCampaignList {
  @Input() routedParams: CampaignParams;
}

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
      imports: [RouterTestingModule],
      declarations: [
        HomeComponent,
        MockGroveCampaignList
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              ...routableParams,
              before: params.before.toISOString(),
              after: params.after.toISOString(),
              geo: params.geo.join('|'),
              zone: params.zone.join('|'),
              desc: 'false'
            })
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
