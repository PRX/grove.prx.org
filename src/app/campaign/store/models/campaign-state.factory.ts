import { Dictionary } from '@ngrx/entity';
import { CampaignStoreState } from '..';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { selectId as selectAllocationPreviewId } from '../reducers/allocation-preview.reducer';
import { Account, docToAccount } from './account.models';
import { Advertiser } from './advertiser.models';
import { AllocationPreview, docToAllocationPreview } from './allocation-preview.models';
import { AvailabilityDay, docToAvailabilityDay } from './availability.models';
import { Campaign } from './campaign.models';
import { Flight } from './flight.models';
import { FlightDays, docToFlightDays } from './flight-days.models';
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
  availability: Math.floor(Math.random() * 1000),
  actuals: i < 15 ? Math.floor(Math.random() * 100) : 0,
  inventory: Math.floor(Math.random() * 1000),
  date: moment
    .utc()
    .add(i - 15, 'days')
    .toISOString()
    .slice(0, 10)
}));

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
    'prx:flight-days': flightDaysData
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

export const flightDaysFixture: FlightDays = docToFlightDays(
  new MockHalDoc(flightDocFixture),
  flightDaysData.map(doc => new MockHalDoc(doc))
);
export const flightDaysEntitities = {
  [flightDocFixture.id]: flightDaysFixture
};
export const createFlightDaysState = () => ({
  flightDays: {
    ids: [flightDocFixture.id],
    entities: flightDaysEntitities
  }
});

export const allocationPreviewParamsFixture = {
  flightId: flightFixture.id,
  startAt: flightFixture.startAt.toDate(),
  endAt: flightFixture.endAt.toDate(),
  name: flightFixture.name,
  set_inventory_uri: flightFixture.set_inventory_uri,
  zones: flightFixture.zones.map(zone => ({ id: zone.id })),
  dailyMinimum: 90,
  totalGoal: flightFixture.totalGoal
};

export const allocationPreviewData: any[] = new Array(30).fill(null).map((_, i) => ({
  goalCount: Math.floor(Math.random() * 100),
  zoneName: 'pre_1',
  date: moment
    .utc()
    .add(i - 15, 'days')
    .toISOString()
    .slice(0, 10)
}));
export const allocationPreviewFixture: AllocationPreview[] = allocationPreviewData.map(allocation => docToAllocationPreview(allocation));
export const allocationPreviewEntities: Dictionary<AllocationPreview> = allocationPreviewFixture.reduce(
  (acc, allocation) => ({ ...acc, [selectAllocationPreviewId(allocation)]: allocation }),
  {}
);

export const createAllocationPreviewState = () => ({
  allocationPreview: {
    ...allocationPreviewParamsFixture,
    ids: allocationPreviewFixture.map(allocation => selectAllocationPreviewId(allocation)),
    entities: allocationPreviewEntities
  }
});

export const availabilityParamsFixture = {
  inventoryId: flightFixture.set_inventory_uri.split('/').pop(),
  startDate: flightFixture.startAt.toDate(),
  endDate: flightFixture.endAt.toDate(),
  zone: flightFixture.zones[0].id,
  flightId: flightFixture.id
};
export const availabilityData = new Array(30).fill(null).map((_, i) => ({
  allocated: Math.floor(Math.random() * 100),
  availability: Math.floor(Math.random() * 1000),
  actuals: i < 15 ? Math.floor(Math.random() * 100) : 0,
  date: moment
    .utc()
    .add(i - 15, 'days')
    .toISOString()
    .slice(0, 10)
}));
export const availabilityDaysFixture: AvailabilityDay[] = availabilityData.map(availability => docToAvailabilityDay(availability));
export const availabilityEntities = {
  [`${availabilityParamsFixture.flightId}_${availabilityParamsFixture.zone}`]: {
    params: availabilityParamsFixture,
    days: availabilityDaysFixture
  }
};
export const createAvailabilityState = () => ({
  availability: {
    ...availabilityParamsFixture,
    ids: [`${availabilityParamsFixture.flightId}_${availabilityParamsFixture.zone}`],
    entities: availabilityEntities
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
  allocationPreview = createAllocationPreviewState(),
  availability = createAvailabilityState(),
  campaignState = createCampaignState(),
  flightsState = createFlightsState(campaignState.campaign.doc),
  flightDaysState = createFlightDaysState()
} = {}): CampaignStoreState => ({
  ...account,
  ...advertiser,
  ...allocationPreview,
  ...availability,
  ...campaignState,
  ...flightsState,
  ...flightDaysState
});
