import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { withLatestFrom } from 'rxjs/operators';

import { TabModule, MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { SharedModule } from '../../shared/shared.module';

import { CampaignFormComponent } from './campaign-form.component';
import { AdvertiserService } from '../service/advertiser.service';
import { AdvertiserServiceMock } from '../service/advertiser.service.mock';
import { UserService } from '../../core/user.service';
import { UserServiceMock } from '../../core/user.service.mock';

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

  it('should get advertiser options', () => {
    let options;
    let advertisers;
    comp.advertiserOptions$.pipe(
      withLatestFrom(mockAdvertiser.advertisers)
    ).subscribe(([optionsResult, advertisersResult]) => {
      options = optionsResult;
      advertisers = advertisersResult;
    });
    // synchronous observable result
    expect(options.length).toEqual(advertisers.length);
    expect(options[0][0]).toEqual(advertisers[0].name);
  });

  it('should get account options', () => {
    let options;
    let accounts;
    let defaultAccount;
    comp.accountOptions$.pipe(
      withLatestFrom(mockUserService.accounts),
      withLatestFrom(mockUserService.defaultAccount)
    ).subscribe((value: [[any[][], MockHalDoc[]], MockHalDoc]) => {
      options = value[0][0];
      accounts = value[0][1];
      defaultAccount = value[1];
    });
    // synchronous observable result
    expect(options.length).toEqual(accounts.length + 1); // defaultAccount + accounts
    expect(options[0][0]).toEqual(defaultAccount.name);
  });
});