import { CampaignStoreState } from '..';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { Account, docToAccount } from './account.models';
import { Advertiser } from './advertiser.models';
import { Campaign } from './campaign.models';
import { Flight } from './flight.models';
import { docToFlightDays } from './flight-days.models';
import * as moment from 'moment';

const augury = new MockHalService();

export const accountsData = [
  {
    id: 1,
    name: 'Person',
    self_uri: '/api/v1/accounts/1'
  },
  {
    id: 28,
    name: 'A Group Account',
    self_uri: '/api/v1/accounts/28'
  }
];
export const accountsFixture: Account[] = accountsData.map(doc => docToAccount(new MockHalDoc(doc)));
export const createAccountState = () => ({
  account: {
    ids: accountsFixture.map(account => account.id),
    entities: accountsFixture.reduce((acc, account) => ({ ...acc, [account.id]: account }), {})
  }
});

export const advertisersFixture: Advertiser[] = [
  {
    id: 1,
    set_advertiser_uri: '/some/uri/1',
    name: 'Adidas'
  },
  {
    id: 2,
    set_advertiser_uri: '/some/uri/2',
    name: 'Griddy'
  },
  {
    id: 3,
    set_advertiser_uri: '/some/uri/3',
    name: 'Toyota'
  }
];
export const advertiserDocsFixture = advertisersFixture.map(a => ({ ...a, _links: { self: { href: a.set_advertiser_uri } } }));

export const createAdvertiserState = () => ({
  advertiser: {
    ids: advertisersFixture.map(advertiser => advertiser.id),
    entities: advertisersFixture.reduce((acc, advertiser) => ({ ...acc, [advertiser.id]: advertiser }), {})
  }
});

export const campaignFixture: Campaign = {
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

export const flightDaysData = new Array(30).fill(null).map((_, i) => ({
  allocated: Math.floor(Math.random() * 100),
  available: Math.floor(Math.random() * 1000),
  actuals: i < 15 ? Math.floor(Math.random() * 100) : 0,
  inventory: Math.floor(Math.random() * 1000),
  date: moment
    .utc()
    .add(i - 15, 'days')
    .toISOString()
    .slice(0, 10)
}));
export const flightDaysDocFixture = (flightDaysData as any[]) as MockHalDoc[];

export const flightFixture: Flight = {
  id: 9,
  createdAt: new Date(),
  name: 'my flight name',
  startAt: moment.utc('2019-10-01'),
  endAt: moment.utc('2019-11-01'),
  totalGoal: 999,
  dailyMinimum: 99,
  zones: [{ id: 'pre_1', label: 'Preroll 1' }],
  set_inventory_uri: '/some/inventory'
};
export const flightDocFixture = {
  ...flightFixture,
  _links: {
    'prx:inventory': { href: '/some/inventory' }
  },
  embedded: {
    'prx:flight-days': flightDaysDocFixture
  }
};

export const createFlightsState = campaignDoc => ({
  flights: {
    ids: [flightFixture.id],
    entities: {
      [flightFixture.id]: {
        localFlight: flightFixture,
        remoteFlight: flightFixture,
        changed: false,
        valid: true,
        softDeleted: false,
        doc: campaignDoc.mock('prx:flight', flightDocFixture)
      }
    }
  }
});

export const flightPreviewParams = {
  name: flightFixture.name,
  set_inventory_uri: flightFixture.set_inventory_uri,
  startAt: flightFixture.startAt.toDate(),
  endAt: flightFixture.endAt.toDate(),
  totalGoal: flightFixture.totalGoal,
  dailyMinimum: flightFixture.dailyMinimum,
  zones: flightFixture.zones.map(zone => zone.id)
};
export const flightDaysEntitities = {
  [flightDocFixture.id]: docToFlightDays(new MockHalDoc(flightDocFixture), flightDocFixture.id, flightDaysDocFixture)
};
export const createFlightDaysState = () => ({
  flightDays: {
    ids: [flightDocFixture.id],
    entities: flightDaysEntitities,
    previewParams: flightPreviewParams,
    previewError: null
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
  account = createAccountState(),
  advertiser = createAdvertiserState(),
  campaignState = createCampaignState(),
  flightsState = createFlightsState(campaignState.campaign.doc),
  flightDaysState = createFlightDaysState()
} = {}): CampaignStoreState => ({
  ...account,
  ...advertiser,
  ...campaignState,
  ...flightsState,
  ...flightDaysState
});
