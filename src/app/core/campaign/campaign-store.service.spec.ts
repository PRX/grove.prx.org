import { CampaignStoreService } from './campaign-store.service';
import { Campaign, CampaignState, Flight, FlightState } from './campaign.models';
import { CampaignService } from './campaign.service';
import { of } from 'rxjs';

describe('CampaignStoreService', () => {
  let store: CampaignStoreService;
  let campaignService: CampaignService;
  let campaignFixture: Campaign;
  let flightFixture: Flight;
  let campaignStateFixture: CampaignState;
  let flightStateFixture: FlightState;

  beforeEach(() => {
    campaignService = {
      getCampaign: jest.fn(id => of(campaignStateFixture)),
      putCampaign: jest.fn(state => of({ ...campaignStateFixture, flights: {} })),
      putFlight: jest.fn(state => of(flightStateFixture))
    } as any;
    store = new CampaignStoreService(campaignService);
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
      zones: [],
      set_inventory_uri: '/some/inventory'
    };
    flightStateFixture = { localFlight: flightFixture, remoteFlight: flightFixture, changed: false, valid: true };
    campaignStateFixture = {
      localCampaign: campaignFixture,
      remoteCampaign: campaignFixture,
      changed: false,
      valid: true,
      flights: { 9: flightStateFixture }
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
      expect(changes).toEqual({ id: 1, prevId: 1, flights: { 9: 9 } });
      done();
    });
    store.load(1);
  });

  it('returns changes for new campaigns and flights', done => {
    const newState = { ...campaignStateFixture, remoteCampaign: null, flights: { 'unsaved-id': { ...flightFixture, remoteFlight: null } } };
    campaignService.getCampaign = jest.fn(id => of(newState)) as any;
    store.storeCampaign().subscribe(changes => {
      expect(changes).toEqual({ id: 1, prevId: null, flights: { 'unsaved-id': 9 } });
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

  it('updates existing flights', done => {
    const existingFlight: FlightState = { localFlight: { ...flightFixture, name: 'foo' }, changed: true, valid: false };
    store.load(1);
    store.setFlight(existingFlight, 9);
    store.campaign$.subscribe(camp => {
      expect(camp.flights['9']).toMatchObject({ ...flightStateFixture, ...existingFlight });
      done();
    });
  });
});
