import { CampaignStoreState } from '..';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { Account, docToAccount } from './account.models';
import { Advertiser } from './advertiser.models';
import { Campaign } from './campaign.models';
import { Flight } from './flight.models';
import { docToFlightDays } from './flight-days.models';
import { Inventory, InventoryTargets } from './inventory.models';
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
    remoteCampaign: campaignFixture,
    changed: false,
    valid: true,
    loading: false,
    loaded: true,
    saving: false,
    doc: augury.mock('prx:campaign', campaignDocFixture)
  }
});

export const creativesFixture = [
  {
    id: 1,
    url: 'some/url',
    filename: 'somefile',
    set_account_uri: 'some/account/id',
    set_advertiser_uri: 'some/advertiser/id',
    createdAt: new Date()
  },
  {
    id: 2,
    url: 'other/url',
    filename: 'otherfile',
    set_account_uri: 'some/account/id',
    set_advertiser_uri: 'some/advertiser/id',
    createdAt: new Date()
  }
];
export const createCreativesState = () => ({
  creatives: {
    ids: creativesFixture.map(c => c.id),
    entities: {
      1: { creative: creativesFixture[0] },
      2: { creative: creativesFixture[1] }
    }
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
  contractStartAt: moment.utc('2019-10-01'),
  contractEndAt: moment.utc('2019-11-01'),
  totalGoal: 999,
  dailyMinimum: 99,
  deliveryMode: 'capped',
  zones: [{ id: 'pre_1', label: 'Preroll 1' }],
  targets: [],
  set_inventory_uri: '/some/inventory/1'
};
export const flightDocFixture = {
  ...flightFixture,
  _links: {
    'prx:inventory': { href: '/some/inventory/1' }
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

export const flightDaysEntitities = {
  [flightDocFixture.id]: docToFlightDays(new MockHalDoc(flightDocFixture), flightDocFixture.id, flightDaysDocFixture)
};
export const createFlightDaysState = () => ({
  flightDays: {
    ids: [flightDocFixture.id],
    entities: flightDaysEntitities,
    preview: true,
    previewError: null
  }
});

export const inventoryFixture: Inventory[] = [
  {
    id: 1,
    podcastTitle: 'Some Title 1',
    self_uri: '/some/inventory/1',
    zones: [
      { id: 'pre', label: 'Preroll' },
      { id: 'orig', label: 'Original' }
    ]
  },
  {
    id: 2,
    podcastTitle: 'Some Title 2',
    self_uri: '/some/inventory/2',
    zones: [
      { id: 'orig', label: 'Original' },
      { id: 'post', label: 'Postroll' }
    ]
  }
];
export const inventoryDocsFixture = inventoryFixture.map(i => new MockHalDoc({ ...i, _links: { self: { href: i.self_uri } } }));
export const createInventoryState = () => ({
  inventory: {
    ids: inventoryFixture.map(inventory => inventory.id),
    entities: inventoryFixture.reduce((acc, inventory) => ({ ...acc, [inventory.id]: inventory }), {})
  }
});

export const inventoryTargetsFixture: InventoryTargets = {
  inventoryId: 1,
  episodes: [{ type: 'episode', code: '1111', label: 'Episode 1' }],
  countries: [{ type: 'country', code: 'CA', label: 'Canadia' }],
  types: [
    { type: 'country', label: 'Country', labelPlural: 'Countries' },
    { type: 'episode', label: 'Episode', labelPlural: 'Episodes' }
  ],
  targets: [
    { type: 'episode', code: '1111', label: 'Episode 1' },
    { type: 'country', code: 'CA', label: 'Canadia' }
  ]
};
export const inventoryTargetsDocFixture = new MockHalDoc(inventoryTargetsFixture);

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
  creativesState = createCreativesState(),
  flightsState = createFlightsState(campaignState.campaign.doc),
  flightDaysState = createFlightDaysState(),
  inventoryState = createInventoryState()
} = {}): CampaignStoreState => ({
  ...account,
  ...advertiser,
  ...campaignState,
  ...creativesState,
  ...flightsState,
  ...flightDaysState,
  ...inventoryState
});
