import { Dictionary } from '@ngrx/entity';
import { CampaignStoreState } from '..';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { selectId as selectAllocationPreviewId } from '../reducers/allocation-preview.reducer';
import { Account, docToAccount } from './account.models';
import { AllocationPreview, docToAllocationPreview } from './allocation-preview.models';
import { Campaign } from './campaign.models';
import { Flight } from './flight.models';
import { docToAvailabilityDay, AvailabilityDay } from './availability.models';

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

export const flightFixture: Flight = {
  id: 9,
  createdAt: new Date(),
  name: 'my flight name',
  startAt: new Date('2019-10-01'),
  endAt: new Date('2019-11-01'),
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

export const allocationPreviewParamsFixture = {
  flightId: flightFixture.id,
  startAt: flightFixture.startAt,
  endAt: flightFixture.endAt,
  name: flightFixture.name,
  set_inventory_uri: flightFixture.set_inventory_uri,
  zones: flightFixture.zones,
  dailyMinimum: 90,
  totalGoal: flightFixture.totalGoal
};

export const allocationPreviewData: any[] = [
  { goalCount: 28, inventoryDayId: 6553, date: '2019-10-01', zoneName: 'pre_1' },
  { goalCount: 16, inventoryDayId: 6560, date: '2019-10-02', zoneName: 'pre_1' },
  { goalCount: 8, inventoryDayId: 6567, date: '2019-10-03', zoneName: 'pre_1' },
  { goalCount: 4, inventoryDayId: 6574, date: '2019-10-04', zoneName: 'pre_1' },
  { goalCount: 3, inventoryDayId: 6581, date: '2019-10-05', zoneName: 'pre_1' },
  { goalCount: 184, inventoryDayId: 6588, date: '2019-10-06', zoneName: 'pre_1' },
  { goalCount: 85, inventoryDayId: 6595, date: '2019-10-07', zoneName: 'pre_1' },
  { goalCount: 36, inventoryDayId: 6602, date: '2019-10-08', zoneName: 'pre_1' },
  { goalCount: 20, inventoryDayId: 6609, date: '2019-10-09', zoneName: 'pre_1' },
  { goalCount: 9, inventoryDayId: 6616, date: '2019-10-10', zoneName: 'pre_1' },
  { goalCount: 4, inventoryDayId: 6623, date: '2019-10-11', zoneName: 'pre_1' },
  { goalCount: 2, inventoryDayId: 6630, date: '2019-10-12', zoneName: 'pre_1' },
  { goalCount: 1, inventoryDayId: 6637, date: '2019-10-13', zoneName: 'pre_1' },
  { goalCount: 1, inventoryDayId: 6644, date: '2019-10-14', zoneName: 'pre_1' },
  { goalCount: 1, inventoryDayId: 6651, date: '2019-10-15', zoneName: 'pre_1' },
  { goalCount: 1, inventoryDayId: 6658, date: '2019-10-16', zoneName: 'pre_1' },
  { goalCount: 1, inventoryDayId: 6665, date: '2019-10-17', zoneName: 'pre_1' },
  { goalCount: 163, inventoryDayId: 6672, date: '2019-10-18', zoneName: 'pre_1' },
  { goalCount: 82, inventoryDayId: 6679, date: '2019-10-19', zoneName: 'pre_1' },
  { goalCount: 33, inventoryDayId: 6686, date: '2019-10-20', zoneName: 'pre_1' },
  { goalCount: 15, inventoryDayId: 6693, date: '2019-10-21', zoneName: 'pre_1' },
  { goalCount: 7, inventoryDayId: 6700, date: '2019-10-22', zoneName: 'pre_1' },
  { goalCount: 4, inventoryDayId: 6707, date: '2019-10-23', zoneName: 'pre_1' },
  { goalCount: 2, inventoryDayId: 6714, date: '2019-10-24', zoneName: 'pre_1' },
  { goalCount: 164, inventoryDayId: 6721, date: '2019-10-25', zoneName: 'pre_1' },
  { goalCount: 71, inventoryDayId: 6728, date: '2019-10-26', zoneName: 'pre_1' },
  { goalCount: 29, inventoryDayId: 6735, date: '2019-10-27', zoneName: 'pre_1' },
  { goalCount: 14, inventoryDayId: 6742, date: '2019-10-28', zoneName: 'pre_1' },
  { goalCount: 7, inventoryDayId: 6749, date: '2019-10-29', zoneName: 'pre_1' },
  { goalCount: 3, inventoryDayId: 6756, date: '2019-10-30', zoneName: 'pre_1' },
  { goalCount: 1, inventoryDayId: 6763, date: '2019-10-31', zoneName: 'pre_1' }
];
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
  startDate: flightFixture.startAt,
  endDate: flightFixture.endAt,
  zone: flightFixture.zones[0],
  flightId: flightFixture.id
};
export const availabilityData = [
  { allocated: null, availability: 1, date: '2019-10-01' },
  { allocated: null, availability: 0, date: '2019-10-02' },
  { allocated: 0, availability: 9858, date: '2019-10-03' },
  { allocated: 0, availability: 5305, date: '2019-10-04' },
  { allocated: 0, availability: 2387, date: '2019-10-05' },
  { allocated: 0, availability: 1339, date: '2019-10-06' },
  { allocated: 0, availability: 709, date: '2019-10-07' },
  { allocated: 0, availability: 357, date: '2019-10-08' },
  { allocated: 0, availability: 158, date: '2019-10-09' },
  { allocated: 0, availability: 85, date: '2019-10-10' },
  { allocated: 0, availability: 48, date: '2019-10-11' },
  { allocated: 0, availability: 19, date: '2019-10-12' },
  { allocated: 0, availability: 8, date: '2019-10-13' },
  { allocated: 0, availability: 4, date: '2019-10-14' },
  { allocated: 0, availability: 1, date: '2019-10-15' },
  { allocated: 0, availability: 10812, date: '2019-10-16' },
  { allocated: 0, availability: 5299, date: '2019-10-17' },
  { allocated: 0, availability: 2527, date: '2019-10-18' },
  { allocated: 0, availability: 1393, date: '2019-10-19' },
  { allocated: 0, availability: 722, date: '2019-10-20' },
  { allocated: 0, availability: 430, date: '2019-10-21' },
  { allocated: 0, availability: 237, date: '2019-10-22' },
  { allocated: 0, availability: 97, date: '2019-10-23' },
  { allocated: 0, availability: 10333, date: '2019-10-24' },
  { allocated: 0, availability: 6174, date: '2019-10-25' },
  { allocated: 0, availability: 3567, date: '2019-10-26' },
  { allocated: 0, availability: 1691, date: '2019-10-27' },
  { allocated: 0, availability: 765, date: '2019-10-28' },
  { allocated: 0, availability: 403, date: '2019-10-29' },
  { allocated: 0, availability: 182, date: '2019-10-30' },
  { allocated: 0, availability: 91, date: '2019-10-31' }
];
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
  allocationPreview = createAllocationPreviewState(),
  availability = createAvailabilityState(),
  campaignState = createCampaignState(),
  flightsState = createFlightsState(campaignState.campaign.doc)
} = {}): CampaignStoreState => ({
  ...account,
  ...allocationPreview,
  ...availability,
  ...campaignState,
  ...flightsState
});
