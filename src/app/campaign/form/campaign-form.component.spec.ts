import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { withLatestFrom } from 'rxjs/operators';

import { TabModule, MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { SharedModule } from '../../shared/shared.module';

import { CampaignFormComponent } from './campaign-form.component';
import { AdvertiserService } from '../service/advertiser.service';
import { AdvertiserServiceMock } from '../service/advertiser.service.mock';
import { UserService } from '../../core/user/user.service';
import { UserServiceMock } from '../../core/user/user.service.mock';

describe('CampaignFormComponent', () => {
  let comp: CampaignFormComponent;
  let fix: ComponentFixture<CampaignFormComponent>;
  let de: DebugElement;
  let el: HTMLElement;
  const mockHal = new MockHalService();
  const mockAdvertiser = new AdvertiserServiceMock(mockHal);
  const mockUserService = new UserServiceMock();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CampaignFormComponent
      ],
      imports: [
        RouterTestingModule,
        SharedModule,
        TabModule
      ],
      providers: [
        {
          provide: AdvertiserService,
          useValue: mockAdvertiser
        },
        {
          provide: UserService,
          useValue: mockUserService
        }
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(CampaignFormComponent);
      comp = fix.componentInstance;
      de = fix.debugElement;
      el = de.nativeElement;

      fix.detectChanges();
    });
  }));

  it('should get advertiser options', (done) => {
    comp.advertiserOptions$.pipe(
      withLatestFrom(mockAdvertiser.advertisers)
    ).subscribe(([options, advertisers]) => {
      expect(options.length).toEqual(advertisers.length);
      expect(options[0][0]).toEqual(advertisers[0].name);
      done();
    });
  });

  it('should get account options', (done) => {
    comp.accountOptions$.pipe(
      withLatestFrom(mockUserService.accounts),
      withLatestFrom(mockUserService.defaultAccount)
    ).subscribe((value: [[any[][], MockHalDoc[]], MockHalDoc]) => {
      const options = value[0][0];
      const accounts = value[0][1];
      const defaultAccount = value[1];
      expect(options.length).toEqual(accounts.length + 1); // defaultAccount + accounts
      expect(options[0][0]).toEqual(defaultAccount['name']);
      done();
    });
  });
});
