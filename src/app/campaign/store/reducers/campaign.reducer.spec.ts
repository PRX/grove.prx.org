import { MockHalDoc } from 'ngx-prx-styleguide';
import { reducer, initialState } from './campaign.reducer';
import * as advertiserActions from '../actions/advertiser-action.creator';
import * as campaignActions from '../actions/campaign-action.creator';
import {
  campaignFixture,
  campaignDocFixture,
  createCampaignState,
  flightFixture,
  flightDocFixture,
  flightDaysDocFixture
} from '../models/campaign-state.factory';

describe('Campaign Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should setup for a new campaign', () => {
    const result = reducer(createCampaignState().campaign, campaignActions.CampaignNew());
    expect(result).toMatchObject({ ...initialState, loaded: true, loading: false });
  });

  it('should update local campaign with campaign form changes', () => {
    let result = reducer(
      initialState,
      campaignActions.CampaignFormUpdate({
        campaign: campaignFixture,
        changed: true,
        valid: true
      })
    );
    expect(result.localCampaign).toMatchObject(campaignFixture);
    result = reducer(
      result,
      campaignActions.CampaignFormUpdate({
        campaign: { name: 'new name' } as any,
        changed: true,
        valid: true
      })
    );
    expect(result.localCampaign.name).toBe('new name');
    expect(result.localCampaign.type).toBe(campaignFixture.type);
  });

  it('should set campaign loading', () => {
    const newResult = reducer(initialState, campaignActions.CampaignNew());
    expect(newResult.loading).toBe(false);

    let loadResult = reducer(initialState, advertiserActions.AdvertisersLoad());
    expect(loadResult.loading).toBe(true);
    loadResult = reducer(loadResult, campaignActions.CampaignLoad({ id: campaignFixture.id }));
    expect(loadResult.loading).toBe(true);
    loadResult = reducer(loadResult, campaignActions.CampaignLoadFailure({ error: 'something bad happened' }));
    expect(loadResult.loading).toBe(false);
    loadResult = reducer(
      loadResult,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    expect(loadResult.loading).toBe(false);
  });

  it('should set campaign loaded', () => {
    let result = reducer(initialState, campaignActions.CampaignLoad({ id: campaignFixture.id }));
    expect(result.loaded).toBe(false);
    result = reducer(initialState, campaignActions.CampaignLoadFailure({ error: 'something bad happened' }));
    expect(result.loaded).toBe(true);
    result = reducer(
      initialState,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    expect(result.loaded).toBe(true);
  });

  it('should set campaign from campaign load success', () => {
    const result = reducer(
      initialState,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    expect(result.localCampaign).toMatchObject(campaignFixture);
    expect(result.remoteCampaign).toMatchObject(campaignFixture);
    expect(result.changed).toBe(false);
    expect(result.valid).toBe(true);
    expect(result.loading).toBe(false);
    expect(result.saving).toBe(false);
  });

  it('should set campaign saving', () => {
    let result = reducer(
      initialState,
      campaignActions.CampaignSave({
        campaign: campaignFixture,
        campaignDoc: new MockHalDoc(campaignDocFixture),
        deletedFlights: [],
        tempDeletedFlights: [],
        updatedFlights: [flightFixture],
        createdFlights: []
      })
    );
    expect(result.saving).toBe(true);
    result = reducer(result, campaignActions.CampaignSaveFailure({ error: 'something bad happened' }));
    expect(result.saving).toBe(false);
    result = reducer(
      result,
      campaignActions.CampaignSaveSuccess({
        campaignDoc: new MockHalDoc(campaignFixture),
        deletedFlightDocs: undefined,
        updatedFlightDocs: { [flightFixture.id]: new MockHalDoc(flightFixture) },
        updatedFlightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture },
        createdFlightDocs: undefined,
        createdFlightDaysDocs: undefined
      })
    );
    expect(result.saving).toBe(false);
  });

  it('should set campaign state from campaign form save success', () => {
    const result = reducer(
      initialState,
      campaignActions.CampaignSaveSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        deletedFlightDocs: undefined,
        updatedFlightDocs: { [flightFixture.id]: new MockHalDoc(flightFixture) },
        updatedFlightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture },
        createdFlightDocs: undefined,
        createdFlightDaysDocs: undefined
      })
    );
    expect(result.localCampaign).toMatchObject(campaignFixture);
    expect(result.remoteCampaign).toMatchObject(campaignFixture);
    expect(result.changed).toBe(false);
    expect(result.valid).toBe(true);
    expect(result.loading).toBe(false);
    expect(result.saving).toBe(false);
  });

  it('should set campaign advertiser after adding new advertiser', () => {
    const result = reducer(
      initialState,
      advertiserActions.AddAdvertiserSuccess({
        doc: new MockHalDoc({ _links: { self: { href: '/some/uri' } } })
      })
    );
    expect(result.localCampaign.set_advertiser_uri).toBe('/some/uri');
  });

  it('should set campaign state for campaign duplicated from form', () => {
    let result = reducer(
      initialState,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    result = reducer(result, campaignActions.CampaignDupFromForm({ campaign: campaignFixture, flights: [flightFixture] }));
    expect(result.localCampaign).not.toMatchObject(campaignFixture);
    expect(result.localCampaign.id).toBeUndefined();
    expect(result.localCampaign.name).toEqual(`Copy of ${campaignFixture.name}`);
  });

  it('should set campaign state for campaign duplicated by id', () => {
    const result = reducer(
      initialState,
      campaignActions.CampaignDupByIdSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)]
      })
    );
    expect(result.localCampaign).not.toMatchObject(campaignFixture);
    expect(result.localCampaign.id).toBeUndefined();
    expect(result.localCampaign.name).toEqual(`Copy of ${campaignFixture.name}`);
  });
});
