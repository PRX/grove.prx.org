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

describe('CampaignFormComponent', () => {
  let component: CampaignFormComponent;
  let fixture: ComponentFixture<CampaignFormComponent>;

  beforeEach(async(() => {
    const augury = new MockHalService();
    const user = new UserServiceMock();
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
            paramMap: of({ get: jest.fn() })
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
