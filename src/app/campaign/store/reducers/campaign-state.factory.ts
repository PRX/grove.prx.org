import { CampaignStoreState } from '..';
import { MockHalDoc } from 'ngx-prx-styleguide';

export const campaignFixture = {
  id: 1,
  name: 'campaign',
  type: 'paid',
  status: 'hold',
  repName: 'me',
  notes: '',
  set_account_uri: 'some/account/id',
  set_advertiser_uri: 'some/advertiser/id'
};
export const flightFixture = {
  id: 9,
  name: 'my flight name',
  startAt: '2019-09-01',
  endAt: '2019-10-01',
  totalGoal: 999,
  zones: [],
  set_inventory_uri: '/some/inventory'
};

export const createCampaignState = () => ({
  campaign: {
    localCampaign: campaignFixture,
    changed: false,
    valid: true,
    loading: false,
    saving: false,
    doc: new MockHalDoc(campaignFixture)
  }
});

export const createState = ({ campaignState = createCampaignState() } = {}): CampaignStoreState => ({ ...campaignState });
