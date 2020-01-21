import { of } from 'rxjs';
import { MockHalService } from 'ngx-prx-styleguide';
import { AccountService, AdvertiserService, CampaignStoreService } from '../../core';
import { AdvertiserServiceMock } from '../../core/advertiser/advertiser.service.mock';
import { CampaignFormContainerComponent } from './campaign-form.container';

describe('CampaignFormContainerComponent', () => {
  let accountService: AccountService;
  let advertiserService: AdvertiserService;
  let campaignStoreService: CampaignStoreService;
  let component: CampaignFormContainerComponent;

  beforeEach(() => {
    accountService = { loadAccounts: jest.fn(() => of([])) } as any;
    advertiserService = new AdvertiserServiceMock(new MockHalService()) as any;
    campaignStoreService = { localCampaign$: of({}), setCampaign: jest.fn(() => of({})) } as any;
    component = new CampaignFormContainerComponent(campaignStoreService, accountService, advertiserService);
  });

  it('sets the campaign', () => {
    const campaign = {
      id: 1,
      name: 'my campaign name',
      type: 'paid_campaign',
      status: 'draft',
      repName: 'my rep name',
      notes: 'my notes',
      set_account_uri: '/some/account',
      set_advertiser_uri: '/some/advertiser'
    };
    const changed = true;
    const valid = false;
    component.campaignUpdateFromForm({ campaign, changed, valid });
    expect(campaignStoreService.setCampaign).toHaveBeenLastCalledWith({ localCampaign: campaign, changed, valid });
  });

  it('sets the campaign after adding a new advertiser', () => {
    component.onAddAdvertiser('Squarespace');
    expect(campaignStoreService.setCampaign).toHaveBeenCalled();
  });
});
