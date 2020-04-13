import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { CampaignService } from './campaign.service';
import { createCampaignStoreState } from '../../campaign/store/models/campaign-state.factory';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

describe('CampaignService', () => {
  let augury: MockHalService;
  let campaignService: CampaignService;
  const state = createCampaignStoreState();
  const campaignStateFixture = state.campaign;
  const campaignFixture = campaignStateFixture.localCampaign;
  const campaignDoc = new MockHalDoc(campaignStateFixture.doc);
  const flightStateFixture = state.flights.entities[state.flights.ids[0]];
  const flightFixture = flightStateFixture.localFlight;
  let store: Store<any>;
  let campaignMock: MockHalDoc;

  beforeEach(() => {
    augury = new MockHalService();
    campaignMock = augury.mock('prx:campaign', campaignFixture);
    store = of({ campaignState: createCampaignStoreState() }) as any;
    campaignService = new CampaignService(new AuguryService(augury as any), store);
  });

  it('loads a campaign with zoomed flights', done => {
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
    campaignService.loadCampaignZoomFlights(campaignFixture.id).subscribe(result => {
      expect(result.campaignDoc.id).toBe(campaignFixture.id);
      expect(result.flightDocs.length).toBe(1);
      expect(result.flightDocs[0].id).toBe(flightFixture.id);
      done();
    });
  });

  it('creates new campaigns', done => {
    const spy = jest.spyOn(augury.root, 'create');
    campaignService.createCampaign(campaignFixture).subscribe(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toEqual('prx:campaign');
      expect(spy.mock.calls[0][2]).toMatchObject(campaignFixture);
      done();
    });
  });

  it('updates existing campaigns', done => {
    const spy = jest.spyOn(campaignDoc, 'update');
    campaignService.updateCampaign(campaignDoc, campaignFixture).subscribe(() => {
      expect(spy).toHaveBeenCalled();
      const { id, ...settable } = campaignFixture;
      expect(spy.mock.calls[0][0]).toMatchObject(settable);
      done();
    });
  });

  it('creates new flights', done => {
    const spy = jest.spyOn(campaignDoc, 'create');
    campaignDoc.mockItems('prx:flights', []);
    campaignService.createFlight(campaignDoc, flightFixture).subscribe(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toEqual('prx:flights');
      expect(spy.mock.calls[0][2]).toMatchObject(flightFixture);
      done();
    });
  });

  it('updates existing flights', done => {
    let spy;
    campaignService.getFlightDocById(flightFixture.id).subscribe(flightDoc => {
      spy = jest.spyOn(flightDoc, 'update');
      campaignDoc.mockItems('prx:flights', [flightDoc]);
    });
    campaignService.updateFlight(flightFixture).subscribe(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toMatchObject(flightFixture);
      done();
    });
  });
});
