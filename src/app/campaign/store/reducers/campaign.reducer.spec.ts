import { MockHalDoc } from 'ngx-prx-styleguide';
import { reducer, initialState } from './campaign.reducer';
import * as ACTIONS from '../actions';
import { campaignFixture, flightFixture } from './campaign-state.factory';

describe('Campaign Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should reset to initial state for a new campaign', () => {
    const result = reducer(
      {
        localCampaign: campaignFixture,
        changed: true,
        valid: true,
        saving: false,
        loading: false
      },
      new ACTIONS.CampaignNew()
    );
    expect(result).toMatchObject(initialState);
  });

  it('should update local campaign with campaign form changes', () => {
    let result = reducer(
      initialState,
      new ACTIONS.CampaignFormUpdate({
        campaign: campaignFixture,
        changed: true,
        valid: true
      })
    );
    expect(result.localCampaign).toMatchObject(campaignFixture);
    result = reducer(
      result,
      new ACTIONS.CampaignFormUpdate({
        campaign: { name: 'new name' } as any,
        changed: true,
        valid: true
      })
    );
    expect(result.localCampaign.name).toBe('new name');
    expect(result.localCampaign.type).toBe(campaignFixture.type);
  });

  it('should set campaign loading', () => {
    let result = reducer(initialState, new ACTIONS.CampaignLoad({ id: campaignFixture.id }));
    expect(result.loading).toBe(true);
    result = reducer(initialState, new ACTIONS.CampaignLoadFailure({ error: 'something bad happened' }));
    expect(result.loading).toBe(false);
    result = reducer(
      initialState,
      new ACTIONS.CampaignLoadSuccess({ campaignDoc: new MockHalDoc(campaignFixture), flightDocs: [new MockHalDoc(flightFixture)] })
    );
    expect(result.loading).toBe(false);
  });

  it('should set campaign from campaign load success', () => {
    const result = reducer(
      initialState,
      new ACTIONS.CampaignLoadSuccess({ campaignDoc: new MockHalDoc(campaignFixture), flightDocs: [new MockHalDoc(flightFixture)] })
    );
    const { _links, ...campaign } = campaignFixture;
    expect(result.localCampaign).toMatchObject(campaign);
    expect(result.remoteCampaign).toMatchObject(campaign);
    expect(result.changed).toBe(false);
    expect(result.valid).toBe(true);
    expect(result.loading).toBe(false);
    expect(result.saving).toBe(false);
  });

  it('should set campaign saving', () => {
    let result = reducer(initialState, new ACTIONS.CampaignFormSave({ campaign: campaignFixture }));
    expect(result.saving).toBe(true);
    result = reducer(initialState, new ACTIONS.CampaignFormSaveFailure({ error: 'something bad happened' }));
    expect(result.saving).toBe(false);
    result = reducer(initialState, new ACTIONS.CampaignFormSaveSuccess({ campaignDoc: new MockHalDoc(campaignFixture) }));
    expect(result.saving).toBe(false);
  });

  it('should set campaign from campaign form save success', () => {
    const result = reducer(initialState, new ACTIONS.CampaignFormSaveSuccess({ campaignDoc: new MockHalDoc(campaignFixture) }));
    const { _links, ...campaign } = campaignFixture;
    expect(result.localCampaign).toMatchObject(campaign);
    expect(result.remoteCampaign).toMatchObject(campaign);
    expect(result.changed).toBe(false);
    expect(result.valid).toBe(true);
    expect(result.loading).toBe(false);
    expect(result.saving).toBe(false);
  });
});
