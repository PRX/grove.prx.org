import { CampaignStoreService } from './campaign-store.service';
import { Campaign, CampaignState, Flight, FlightState, Availability } from './campaign.models';
import { CampaignService } from './campaign.service';
import { InventoryService } from '../inventory/inventory.service';
import { of } from 'rxjs';

describe('CampaignStoreService', () => {
  let store: CampaignStoreService;
  let campaignService: CampaignService;
  let inventoryService: InventoryService;
  let campaignFixture: Campaign;
  let flightFixture: Flight;
  let campaignStateFixture: CampaignState;
  let flightStateFixture: FlightState;
  let availabilityFixture: Availability;

  beforeEach(() => {
    campaignService = {
      getCampaign: jest.fn(id => of(campaignStateFixture)),
      putCampaign: jest.fn(state => of({ ...campaignStateFixture, flights: {} })),
      putFlight: jest.fn(state => of(flightStateFixture)),
      deleteFlight: jest.fn(id => of({ id }))
    } as any;
    inventoryService = {
      getInventoryAvailability: jest.fn(flight => of(availabilityFixture))
    } as any;

    store = new CampaignStoreService(campaignService, inventoryService);
    campaignFixture = {
      id: 1,
      name: 'my campaign name',
      type: 'paid_campaign',
      status: 'draft',
      repName: 'my rep name',
      notes: 'my notes',
      set_account_uri: '/some/account',
      set_advertiser_uri: '/some/advertiser'
    };
    flightFixture = {
      id: 9,
      name: 'my flight name',
      startAt: '2019-09-01',
      endAt: '2019-10-01',
      totalGoal: 999,
      zones: ['pre_1'],
      set_inventory_uri: '/some/inventory'
    };
    flightStateFixture = { localFlight: flightFixture, remoteFlight: flightFixture, changed: false, valid: true };
    availabilityFixture = {
      zone: 'pre_1',
      totals: {
        startDate: '2019-10-01',
        endDate: '2019-11-01',
        groups: [
          { allocated: 0, availability: 1, startDate: '2019-10-01', endDate: '2019-10-01' },
          { allocated: 0, availability: 0, startDate: '2019-10-02', endDate: '2019-10-02' },
          { allocated: 0, availability: 9858, startDate: '2019-10-03', endDate: '2019-10-03' },
          { allocated: 0, availability: 5305, startDate: '2019-10-04', endDate: '2019-10-04' },
          { allocated: 0, availability: 2387, startDate: '2019-10-05', endDate: '2019-10-05' },
          { allocated: 0, availability: 1339, startDate: '2019-10-06', endDate: '2019-10-06' },
          { allocated: 0, availability: 709, startDate: '2019-10-07', endDate: '2019-10-07' },
          { allocated: 0, availability: 357, startDate: '2019-10-08', endDate: '2019-10-08' },
          { allocated: 0, availability: 158, startDate: '2019-10-09', endDate: '2019-10-09' },
          { allocated: 0, availability: 85, startDate: '2019-10-10', endDate: '2019-10-10' },
          { allocated: 0, availability: 48, startDate: '2019-10-11', endDate: '2019-10-11' },
          { allocated: 0, availability: 19, startDate: '2019-10-12', endDate: '2019-10-12' },
          { allocated: 0, availability: 8, startDate: '2019-10-13', endDate: '2019-10-13' },
          { allocated: 0, availability: 4, startDate: '2019-10-14', endDate: '2019-10-14' },
          { allocated: 0, availability: 1, startDate: '2019-10-15', endDate: '2019-10-15' },
          { allocated: 0, availability: 10812, startDate: '2019-10-16', endDate: '2019-10-16' },
          { allocated: 0, availability: 5299, startDate: '2019-10-17', endDate: '2019-10-17' },
          { allocated: 0, availability: 2527, startDate: '2019-10-18', endDate: '2019-10-18' },
          { allocated: 0, availability: 1393, startDate: '2019-10-20', endDate: '2019-10-20' },
          { allocated: 0, availability: 722, startDate: '2019-10-20', endDate: '2019-10-20' },
          { allocated: 0, availability: 430, startDate: '2019-10-21', endDate: '2019-10-21' },
          { allocated: 0, availability: 237, startDate: '2019-10-22', endDate: '2019-10-22' },
          { allocated: 0, availability: 97, startDate: '2019-10-23', endDate: '2019-10-23' },
          { allocated: 0, availability: 10333, startDate: '2019-10-24', endDate: '2019-10-24' },
          { allocated: 0, availability: 6174, startDate: '2019-10-25', endDate: '2019-10-25' },
          { allocated: 0, availability: 3567, startDate: '2019-10-26', endDate: '2019-10-26' },
          { allocated: 0, availability: 1691, startDate: '2019-10-27', endDate: '2019-10-27' },
          { allocated: 0, availability: 765, startDate: '2019-10-28', endDate: '2019-10-28' },
          { allocated: 0, availability: 403, startDate: '2019-10-29', endDate: '2019-10-29' },
          { allocated: 0, availability: 182, startDate: '2019-10-30', endDate: '2019-10-30' },
          { allocated: 0, availability: 91, startDate: '2019-10-31', endDate: '2019-10-31' }
        ]
      }
    };
    campaignStateFixture = {
      localCampaign: campaignFixture,
      remoteCampaign: campaignFixture,
      changed: false,
      valid: true,
      flights: { 9: flightStateFixture },
      availability: { '9-pre_1': availabilityFixture }
    };
  });

  it('creates a new campaign', done => {
    store.campaign$.subscribe(camp => {
      expect(camp.remoteCampaign).toBeFalsy();
      expect(camp.localCampaign).toMatchObject({ name: null });
      expect(camp.flights).toEqual({});
      expect(camp.changed).toBeFalsy();
      expect(camp.valid).toBeFalsy();
      done();
    });
    store.load(null);
  });

  it('loads an existing campaign', done => {
    store.campaign$.subscribe(camp => {
      expect(camp).toMatchObject(campaignStateFixture);
      done();
    });
    store.load(1);
  });

  it('stores a campaign', done => {
    store.storeCampaign().subscribe(changes => {
      expect(changes).toEqual([{ id: 1, prevId: 1, flights: { 9: 9 } }, []]);
      done();
    });
    store.load(1);
  });

  it('returns changes for new campaigns and flights', done => {
    const unsavedId = 'unsaved-id';
    const newState = { ...campaignStateFixture, remoteCampaign: null, flights: { 'unsaved-id': { ...flightFixture, remoteFlight: null } } };
    campaignService.getCampaign = jest.fn(id => of(newState)) as any;
    store.storeCampaign().subscribe(([changes, deletedDocs]) => {
      expect(changes).toEqual({ id: 1, prevId: null, flights: { 'unsaved-id': 9 } });
      done();
    });
    store.load(1);
  });

  it('returns deletion docs for deleted flights', done => {
    const deletedId = 'deleted-id';
    const newState = {
      ...campaignStateFixture,
      remoteCampaign: { ...campaignFixture },
      flights: {
        [deletedId]: {
          ...flightStateFixture,
          ...{ remoteFlight: { ...flightStateFixture.remoteFlight, id: deletedId }, softDeleted: true }
        }
      }
    };
    campaignService.putCampaign = jest.fn(id => of(newState)) as any;
    store.storeCampaign().subscribe(([changes, deletedDocs]) => {
      expect(campaignService.deleteFlight).toHaveBeenCalledWith(deletedId);
      expect(deletedDocs).toMatchObject([{ id: deletedId }]);
      done();
    });
    store.load(1);
  });

  it('removes and deletes flights marked for deletion when storing a campaign', done => {
    const softDeletedId = 'deletion-id';
    const newState = {
      ...campaignStateFixture,
      remoteCampaign: { ...campaignFixture },
      flights: { [softDeletedId]: { ...flightStateFixture, softDeleted: true } }
    };
    const removeFlightSpy = jest.spyOn(store, 'removeFlight');
    campaignService.putCampaign = jest.fn(id => of(newState));
    store.storeCampaign().subscribe(changes => {
      expect(removeFlightSpy).toHaveBeenCalledWith(softDeletedId);
      expect(campaignService.deleteFlight).toHaveBeenCalledWith(softDeletedId);
      done();
    });
    store.load(1);
  });

  it('updates campaigns', done => {
    const updateCampaign = { localCampaign: { ...campaignFixture, name: 'foo' }, changed: true, valid: false };
    store.load(1);
    store.setCampaign(updateCampaign);
    store.campaign$.subscribe(camp => {
      expect(camp).toMatchObject({ ...campaignStateFixture, ...updateCampaign });
      done();
    });
  });

  it('adds new flights', done => {
    const newFlight: FlightState = { localFlight: flightFixture, changed: true, valid: false };
    store.load(1);
    store.setFlight(newFlight, 9999);
    store.campaign$.subscribe(camp => {
      expect(camp.flights['9999']).toEqual(newFlight);
      done();
    });
  });

  it('removes flights', done => {
    const [retainId, deleteId] = [1, 2];
    const retainFlight: FlightState = { localFlight: { ...flightFixture, id: retainId }, changed: true, valid: false };
    const deleteFlight: FlightState = { localFlight: { ...flightFixture, id: deleteId }, changed: true, valid: false };
    store.load(1);

    store.setFlight(retainFlight, retainId);
    store.setFlight(deleteFlight, deleteId);
    store.campaign$
      .subscribe(camp => {
        expect(Object.keys(camp.flights).length).toEqual(3);
      })
      .unsubscribe();
    store.removeFlight(deleteId);
    store.campaign$.subscribe(camp => {
      expect(Object.keys(camp.flights).length).toEqual(2);
      expect(camp.flights[retainId].localFlight.id).toEqual(retainId);
      done();
    });
  });

  it('updates existing flights', done => {
    const existingFlight: FlightState = { localFlight: { ...flightFixture, name: 'foo' }, changed: true, valid: false };
    store.load(1);
    store.setFlight(existingFlight, 9);
    store.campaign$.subscribe(camp => {
      expect(camp.flights['9']).toMatchObject({ ...flightStateFixture, ...existingFlight });
      done();
    });
  });

  it('loads availability', done => {
    store.load(1);
    store.loadAvailability(flightFixture).subscribe(availabilty => {
      expect(availabilty.length).toEqual(flightFixture.zones.length);
      expect(availabilty[0].zone).toEqual(flightFixture.zones[0]);
      expect(availabilty[0].totals.groups.length).toEqual(availabilityFixture.totals.groups.length);
      done();
    });
  });

  it('gets flight availability weekly rollup', done => {
    store.load(1);
    store.loadAvailability(flightFixture);
    store.getFlightAvailabilityRollup$(flightFixture.id.toString()).subscribe(rollup => {
      expect(rollup.length).toEqual(flightFixture.zones.length);
      expect(rollup[0].zone).toEqual(flightFixture.zones[0]);
      expect(rollup[0].totals.startDate).toEqual(availabilityFixture.totals.startDate);
      expect(rollup[0].totals.endDate).toEqual(availabilityFixture.totals.endDate);
      expect(rollup[0].totals.groups.length).toBeGreaterThanOrEqual(availabilityFixture.totals.groups.length / 7);
      expect(new Date(rollup[0].totals.groups[1].startDate + ' 0:0:0').getDay()).toEqual(0);
      done();
    });
  });
});
