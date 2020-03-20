import { CampaignStoreState } from '..';
import { MockHalService } from 'ngx-prx-styleguide';
import { selectId as selectAllocationPreviewId } from '../reducers/allocation-preview.reducer';
import { Campaign } from './campaign.models';
import { Flight } from './flight.models';
import { docToAllocationPreview, AllocationPreview } from './allocation-preview.models';

const augury = new MockHalService();

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
  zones: flightFixture.zones,
  dailyMinimum: 90,
  totalGoal: flightFixture.totalGoal
};

export const allocationPreviewFixture: AllocationPreview[] = [
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
].map(allocation => docToAllocationPreview(allocation));
export const allocationPreviewEntities = allocationPreviewFixture.reduce(
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
  flightsState = createFlightsState(campaignState.campaign.doc),
  allocationPreview = createAllocationPreviewState()
} = {}): CampaignStoreState => ({
  ...campaignState,
  ...flightsState,
  ...allocationPreview
});
