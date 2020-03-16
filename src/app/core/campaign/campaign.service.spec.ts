import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { CampaignService } from './campaign.service';
import { createCampaignStoreState, flightDocFixture } from '../../campaign/store/models/campaign-state.factory';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

describe('CampaignService', () => {
  let augury: MockHalService;
  let campaignService: CampaignService;
  const state = createCampaignStoreState();
  const campaignStateFixture = state.campaign;
  const campaignFixture = campaignStateFixture.localCampaign;
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
      const { campaignDoc, flightDocs } = result;
      expect(campaignDoc.id).toBe(campaignFixture.id);
      expect(flightDocs.length).toBe(1);
      expect(flightDocs[0].id).toBe(flightFixture.id);
      done();
    });
  });

  // TODO: moved to models
  xit('filters underscores', () => {
    const doc = augury.mock('any:thing', { foo: 'bar', _under: 'scored' });
    // expect(campaignService.filter(doc)).not.toHaveProperty('_under');
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
    let spy;
    campaignService.campaignDoc$.subscribe(doc => (spy = jest.spyOn(doc, 'update')));
    campaignService.updateCampaign(campaignFixture).subscribe(() => {
      expect(spy).toHaveBeenCalled();
      const { id, ...settable } = campaignFixture;
      expect(spy.mock.calls[0][0]).toMatchObject(settable);
      done();
    });
  });

  it('creates new flights', done => {
    let spy;
    campaignService.campaignDoc$.subscribe(doc => {
      (doc as MockHalDoc).mockItems('prx:flights', []);
      spy = jest.spyOn(doc, 'create');
    });
    campaignService.createFlight(flightFixture).subscribe(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toEqual('prx:flights');
      expect(spy.mock.calls[0][2]).toMatchObject(flightFixture);
      done();
    });
  });

  it('updates existing flights', done => {
    let spy;
    campaignService.campaignDoc$
      .pipe(withLatestFrom(campaignService.getFlightDocById(flightFixture.id)))
      .subscribe(([campaignDoc, flightDoc]) => {
        (campaignDoc as MockHalDoc).mockItems('prx:flights', [flightDocFixture]);
        spy = jest.spyOn(flightDoc, 'update');
      });
    campaignService.updateFlight(flightFixture).subscribe(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toMatchObject(flightFixture);
      done();
    });
  });
});
