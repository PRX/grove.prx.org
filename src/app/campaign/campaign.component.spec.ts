import { CampaignComponent } from './campaign.component';
import { AccountService, AdvertiserService, CampaignService, Campaign } from 'src/app/core';
import { of, ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-prx-styleguide';
import { map } from 'rxjs/operators';

describe('CampaignComponent', () => {
  let accountService: AccountService;
  let advertiserService: AdvertiserService;
  let campaignService: CampaignService;
  let routeId: ReplaySubject<string>;
  let route: ActivatedRoute;
  let router: Router;
  let toastrService: ToastrService;
  let component: CampaignComponent;

  function campaignFactory(attrs = {}): Campaign {
    return {
      id: 1,
      name: 'my campaign name',
      type: 'paid_campaign',
      status: 'draft',
      repName: 'my rep name',
      notes: 'my notes',
      set_account_uri: '/some/account',
      set_advertiser_uri: '/some/advertiser',
      ...attrs
    };
  }

  beforeEach(() => {
    accountService = <any>{ listAccounts: jest.fn(() => of([])) };
    advertiserService = <any>{ listAdvertisers: jest.fn(() => of([])) };
    campaignService = <any>{
      getCampaign: jest.fn(() => of(campaignFactory())),
      putCampaign: jest.fn(() => of(campaignFactory()))
    };
    routeId = new ReplaySubject(1);
    route = <any>{
      paramMap: routeId.pipe(
        map(id => {
          return { get: jest.fn(() => id) };
        })
      )
    };
    router = <any>{ navigate: jest.fn() };
    toastrService = <any>{ success: jest.fn() };
    component = new CampaignComponent(accountService, advertiserService, campaignService, route, router, toastrService);
  });

  it('loads the campaign from the route', () => {
    expect(component.campaign$.value).toBeNull();
    routeId.next('123');
    expect(campaignService.getCampaign).toHaveBeenCalledWith('123');
    expect(component.campaign$.value).toEqual(campaignFactory());
  });

  it('updates the campaign subject', () => {
    component.campaignUpdate(campaignFactory({ id: 456, name: 'other' }));
    expect(component.campaign$.value).toMatchObject({ id: 456, name: 'other' });
  });

  it('updates an existing campaign', () => {
    const campaign = campaignFactory({ id: 999, name: 'Existing' });
    component.campaign$.next(campaign);
    component.campaignSubmit();
    expect(campaignService.putCampaign).toHaveBeenCalledWith(campaign);
    expect(toastrService.success).toHaveBeenCalledWith('Campaign saved');
  });

  it('creates a new campaign', () => {
    const campaign = campaignFactory({ id: null, name: 'Brand New' });
    component.campaign$.next(campaign);
    component.campaignSubmit();
    expect(campaignService.putCampaign).toHaveBeenCalledWith(campaign);
    expect(toastrService.success).toHaveBeenCalledWith('Campaign saved');
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', 1]);
  });
});
