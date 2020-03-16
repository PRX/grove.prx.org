import { CampaignStoreState } from '..';
import { MockHalService } from 'ngx-prx-styleguide';

const augury = new MockHalService();

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
export const campaignDocFixture = {
  ...campaignFixture,
  _links: {
    'prx:account': { href: 'some/account/id' },
    'prx:advertiser': { href: 'some/advertiser/id' }
  }
};

export const createCampaignState = () => ({
  campaign: {
    localCampaign: campaignFixture,
    changed: false,
    valid: true,
    loading: false,
    loaded: true,
    saving: false,
    doc: augury.mock('prx:campaign', campaignDocFixture)
  }
});

export const flightFixture = {
  id: 9,
  createdAt: new Date(),
  name: 'my flight name',
  startAt: new Date('2019-09-01'),
  endAt: new Date('2019-10-01'),
  totalGoal: 999,
  zones: ['pre_1'],
  set_inventory_uri: '/some/inventory'
};
export const flightDocFixture = {
  ...flightFixture,
  _links: {
    'prx:inventory': { href: '/some/inventory' }
  }
};

export const createFlightsState = campaignDoc => ({
  flights: {
    ids: [flightFixture.id],
    entities: {
      [flightFixture.id]: {
        id: flightFixture.id,
        localFlight: flightFixture,
        remoteFlight: flightFixture,
        dailyMinimum: 99,
        changed: false,
        valid: true,
        softDeleted: false,
        doc: campaignDoc.mock('prx:flight', flightDocFixture)
      }
    }
  }
});

export const createRouterState = () => ({
  router: {
    state: {
      id: campaignFixture.id,
      flightId: flightFixture.id
    }
  }
});

export const createCampaignStoreState = ({
  campaignState = createCampaignState(),
  flightsState = createFlightsState(campaignState.campaign.doc)
} = {}): CampaignStoreState => ({
  ...campaignState,
  ...flightsState
});
