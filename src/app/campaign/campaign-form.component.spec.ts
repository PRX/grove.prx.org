import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HalService, MockHalService, MockHalDoc, ToastrService } from 'ngx-prx-styleguide';

import { AuguryService } from '../core/augury.service';
import { CampaignFormComponent } from './campaign-form.component';
import { UserServiceMock } from '../core/user/user.service.mock';
import { UserService } from '../core/user/user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('CampaignFormComponent', () => {
  let component: CampaignFormComponent;
  let fixture: ComponentFixture<CampaignFormComponent>;
  let de: DebugElement;
  let augury;
  let user;

  beforeEach(async(() => {
    augury = new MockHalService();
    user = new UserServiceMock();
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [CampaignFormComponent],
      providers: [
        {
          provide: ToastrService,
          useValue: { success: jest.fn() }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: jest.fn(() => '1') })
          }
        },
        { provide: HalService, useValue: augury },
        { provide: AuguryService, useValue: augury.root },
        { provide: UserService, useValue: user }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignFormComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
  });

  describe('with an existing campaign', () => {
    beforeEach(() => {
      augury.mock('prx:campaign', {
        id: '1',
        name: 'my campaign name',
        type: 'paid_campaign',
        status: 'draft',
        repName: 'my rep name',
        notes: 'my notes',
        _links: {
          'prx:account': { href: '/some/account' },
          'prx:advertiser': { href: '/some/advertiser' }
        }
      });
      augury.mockItems('prx:advertisers', []);
      fixture.detectChanges();
    });

    it('decodes the campaign', () => {
      expect(component.set_account_id.value).toEqual('/some/account');
      expect(component.name.value).toEqual('my campaign name');
      expect(component.type.value).toEqual('paid_campaign');
      expect(component.status.value).toEqual('draft');
      expect(component.repName.value).toEqual('my rep name');
      expect(component.notes.value).toEqual('my notes');
      expect(component.set_advertiser_uri.value).toEqual('/some/advertiser');
    });

    xit('saves changes to the campaign', () => {
      component.name.setValue('something else');
      component.campaignFormSubmit();
      // TODO: how to check updated value? spy on haldoc.update?
    })
  });
});
