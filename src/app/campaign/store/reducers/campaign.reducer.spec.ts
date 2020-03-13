import { MockHalDoc } from 'ngx-prx-styleguide';
import { reducer, initialState } from './campaign.reducer';
import * as actions from '../actions';
import { campaignFixture, campaignDocFixture, flightDocFixture, createCampaignState, flightFixture } from './campaign-state.factory';

describe('Campaign Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should setup for a new campaign', () => {
    const result = reducer(createCampaignState().campaign, new actions.CampaignNew());
    expect(result).toMatchObject({ ...initialState, loaded: true, loading: false });
  });

  it('should update local campaign with campaign form changes', () => {
    let result = reducer(
      initialState,
      new actions.CampaignFormUpdate({
        campaign: campaignFixture,
        changed: true,
        valid: true
      })
    );
    expect(result.localCampaign).toMatchObject(campaignFixture);
    result = reducer(
      result,
      new actions.CampaignFormUpdate({
        campaign: { name: 'new name' } as any,
        changed: true,
        valid: true
      })
    );
    expect(result.localCampaign.name).toBe('new name');
    expect(result.localCampaign.type).toBe(campaignFixture.type);
  });

  it('should set campaign loading', () => {
    const newResult = reducer(initialState, new actions.CampaignNew());
    expect(newResult.loading).toBe(false);

    let loadResult = reducer(initialState, new actions.CampaignLoadOptions());
    expect(loadResult.loading).toBe(true);
    loadResult = reducer(loadResult, new actions.CampaignLoad({ id: campaignFixture.id }));
    expect(loadResult.loading).toBe(true);
    loadResult = reducer(loadResult, new actions.CampaignLoadFailure({ error: 'something bad happened' }));
    expect(loadResult.loading).toBe(false);
    loadResult = reducer(
      loadResult,
      new actions.CampaignLoadSuccess({ campaignDoc: new MockHalDoc(campaignDocFixture), flightDocs: [new MockHalDoc(flightDocFixture)] })
    );
    expect(loadResult.loading).toBe(false);
  });

  it('should set campaign loaded', () => {
    let result = reducer(initialState, new actions.CampaignLoad({ id: campaignFixture.id }));
    expect(result.loaded).toBe(false);
    result = reducer(initialState, new actions.CampaignLoadFailure({ error: 'something bad happened' }));
    expect(result.loaded).toBe(true);
    result = reducer(
      initialState,
      new actions.CampaignLoadSuccess({ campaignDoc: new MockHalDoc(campaignDocFixture), flightDocs: [new MockHalDoc(flightDocFixture)] })
    );
    expect(result.loaded).toBe(true);
  });

  it('should set campaign from campaign load success', () => {
    const result = reducer(
      initialState,
      new actions.CampaignLoadSuccess({ campaignDoc: new MockHalDoc(campaignDocFixture), flightDocs: [new MockHalDoc(flightDocFixture)] })
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
      new actions.CampaignSave({ campaign: campaignFixture, deletedFlights: [], updatedFlights: [flightFixture], createdFlights: [] })
    );
    expect(result.saving).toBe(true);
    result = reducer(result, new actions.CampaignSaveFailure({ error: 'something bad happened' }));
    expect(result.saving).toBe(false);
    result = reducer(
      result,
      new actions.CampaignSaveSuccess({
        campaignDoc: new MockHalDoc(campaignFixture),
        deletedFlightDocs: undefined,
        updatedFlightDocs: { [flightFixture.id]: new MockHalDoc(flightFixture) },
        createdFlightDocs: undefined
      })
    );
    expect(result.saving).toBe(false);
  });

  it('should set campaign from campaign form save success', () => {
    const result = reducer(
      initialState,
      new actions.CampaignSaveSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        deletedFlightDocs: undefined,
        updatedFlightDocs: { [flightFixture.id]: new MockHalDoc(flightFixture) },
        createdFlightDocs: undefined
      })
    );
    expect(result.localCampaign).toMatchObject(campaignFixture);
    expect(result.remoteCampaign).toMatchObject(campaignFixture);
    expect(result.changed).toBe(false);
    expect(result.valid).toBe(true);
    expect(result.loading).toBe(false);
    expect(result.saving).toBe(false);
  });

  it('should set campaign advertiser', () => {
    const result = reducer(
      initialState,
      new actions.CampaignSetAdvertiser({
        set_advertiser_uri: '/some/uri'
      })
    );
    expect(result.localCampaign.set_advertiser_uri).toBe('/some/uri');
  });
});
