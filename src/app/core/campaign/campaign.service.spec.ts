import { CampaignService } from './campaign.service';
import { Campaign, CampaignState, Flight, FlightState } from './campaign.models';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

// TODO: styleguide doesn't export HalHttpError class
class Mock404Error extends Error {
  status = 404;
  constructor() {
    super('');
  }
}

describe('CampaignService', () => {
  let augury: MockHalService;
  let campaign: CampaignService;
  let campaignFixture: Campaign;
  let flightFixture: Flight;
  let campaignStateFixture: CampaignState;
  let flightStateFixture: FlightState;

  beforeEach(() => {
    augury = new MockHalService();
    campaign = new CampaignService(new AuguryService(augury as any));
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

  it('gets a campaign + flights', done => {
    const { set_account_uri, set_advertiser_uri, ...campaignProperties } = campaignFixture;
    const { set_inventory_uri, ...flightProperties } = flightFixture;
    augury
      .mock('prx:campaign', {
        ...campaignProperties,
        _links: { 'prx:account': { href: set_account_uri }, 'prx:advertiser': { href: set_advertiser_uri } }
      })
      .mockItems('prx:flights', [
        {
          ...flightProperties,
          _links: { 'prx:inventory': { href: set_inventory_uri } }
        }
      ]);
    campaign.getCampaign(1).subscribe(camp => {
      expect(camp.localCampaign).toMatchObject(campaignFixture);
      expect(camp.remoteCampaign).toMatchObject(campaignFixture);
      expect(camp.changed).toBeFalsy();
      expect(camp.valid).toBeTruthy();
      expect(Object.keys(camp.flights)).toEqual(['9']);
      expect(camp.flights['9'].localFlight).toMatchObject(flightFixture);
      expect(camp.flights['9'].remoteFlight).toMatchObject(flightFixture);
      expect(camp.flights['9'].changed).toBeFalsy();
      expect(camp.flights['9'].valid).toBeTruthy();
      done();
    });
  });

  it('gets null for nonexistent campaign', done => {
    augury.mockError('prx:campaign', new Mock404Error());
    campaign.getCampaign(1).subscribe(camp => {
      expect(camp).toBeNull();
      done();
    });
  });

  it('filters underscores', () => {
    const doc = augury.mock('any:thing', { foo: 'bar', _under: 'scored' });
    expect(campaign.filter(doc)).not.toHaveProperty('_under');
  });

  it('creates new campaigns', done => {
    const spy = jest.spyOn(augury.root, 'create');
    campaign.putCampaign({ ...campaignStateFixture, remoteCampaign: null, changed: true }).subscribe(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toEqual('prx:campaign');
      expect(spy.mock.calls[0][2]).toMatchObject(campaignFixture);
      done();
    });
  });

  it('updates existing campaigns', done => {
    const doc = augury.mock('prx:campaign', { any: 'thing' });
    doc.mockItems('prx:flights', []);
    const spy = jest.spyOn(doc, 'update');
    campaign.getCampaign(1).subscribe();
    campaign.putCampaign({ ...campaignStateFixture, changed: true }).subscribe(() => {
      expect(spy).toHaveBeenCalled();
      const { id, ...settable } = campaignFixture;
      expect(spy.mock.calls[0][0]).toMatchObject(settable);
      done();
    });
  });

  it('ignores unchanged campaigns', done => {
    const spy = jest.spyOn(augury.root, 'create');
    campaign.putCampaign({ ...campaignStateFixture, remoteCampaign: null, changed: false }).subscribe(() => {
      expect(spy).not.toHaveBeenCalled();
      done();
    });
  });

  describe('with an existing campaign', () => {
    let doc: MockHalDoc;
    beforeEach(() => {
      doc = augury.mock('prx:campaign', {});
      doc.mockItems('prx:flights', []);
      campaign.getCampaign(1).subscribe();
    });

    it('creates new flights', done => {
      const spy = jest.spyOn(doc, 'create');
      campaign.putFlight({ ...flightStateFixture, remoteFlight: null, changed: true }).subscribe(() => {
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toEqual('prx:flights');
        expect(spy.mock.calls[0][2]).toMatchObject(flightFixture);
        done();
      });
    });

    it('updates existing flights', done => {
      const { set_inventory_uri, ...flightProperties } = flightFixture;
      const flights = doc.mockItems('prx:flights', [{ ...flightProperties, _links: { 'prx:inventory': { href: set_inventory_uri } } }]);
      campaign.getCampaign(1).subscribe();
      const spy = jest.spyOn(flights[0], 'update');
      campaign.putFlight({ ...flightStateFixture, changed: true }).subscribe(() => {
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]).toMatchObject(flightFixture);
        done();
      });
    });

    it('ignores unchanged flights', done => {
      const spy = jest.spyOn(doc, 'create');
      campaign.putFlight({ ...flightStateFixture, remoteFlight: null, changed: false }).subscribe(() => {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
