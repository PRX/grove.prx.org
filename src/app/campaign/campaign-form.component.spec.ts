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
    fixture.detectChanges();
  });

  describe('should decode a campaign', () => {
    beforeEach(() => {
      augury.mock('prx:campaign', { id: '1', name: 'whatever' });
      augury.mockItems('prx:advertisers', []);
      fixture.detectChanges();
    });

    it('has campaign data in the form', () => {
      expect(component).toBeTruthy();
    });
  });
});
