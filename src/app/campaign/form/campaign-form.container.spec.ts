import { of } from 'rxjs';
import { AccountService, AdvertiserService, CampaignStoreService } from '../../core';
import { CampaignFormContainerComponent } from './campaign-form.container';

describe('CampaignFormContainerComponent', () => {
  let accountService: AccountService;
  let advertiserService: AdvertiserService;
  let campaignStoreService: CampaignStoreService;
  let component: CampaignFormContainerComponent;

  beforeEach(() => {
    accountService = { listAccounts: jest.fn(() => of([])) } as any;
    advertiserService = { listAdvertisers: jest.fn(() => of([])) } as any;
    campaignStoreService = { setCampaign: jest.fn(() => of({})) } as any;
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
});
