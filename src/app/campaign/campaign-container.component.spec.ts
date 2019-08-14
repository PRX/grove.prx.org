import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { TabModule, MockHalService } from 'ngx-prx-styleguide';
import { SharedModule } from '../shared/shared.module';

import { CampaignContainerComponent } from './campaign-container.component';
import { CampaignComponent } from './campaign.component';
import { CampaignStatusComponent } from './campaign-status.component';
import { CampaignService } from './service/campaign.service';
import { CampaignServiceMock } from './service/campaign.service.mock';

describe('CampaignContainerComponent', () => {
  let comp: CampaignContainerComponent;
  let fix: ComponentFixture<CampaignContainerComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockCampaign = new CampaignServiceMock(mockHal);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CampaignContainerComponent,
        CampaignComponent,
        CampaignStatusComponent
      ],
      imports: [
        RouterTestingModule,
        SharedModule,
        TabModule
      ],
      providers: [
        {
          provide: CampaignService,
          useValue: mockCampaign
        }
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(CampaignContainerComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;

      comp.id = 1;
      fix.detectChanges();
    });
  }));

  it('should get campaign by id', () => {
    comp.campaign$.subscribe(campaign =>
      expect(campaign.id).toEqual(comp.id)
    );
  });
});
