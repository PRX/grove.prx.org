import { MockHalDoc } from 'ngx-prx-styleguide';
import { reducer, initialState } from './campaign.reducer';
import * as actions from '../actions';
import { campaignFixture, campaignDocFixture, flightDocFixture, createCampaignState } from './campaign-state.factory';

describe('Campaign Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should reset to initial state for a new campaign', () => {
    const result = reducer(createCampaignState().campaign, new actions.CampaignNew());
    expect(result).toMatchObject(initialState);
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
    let result = reducer(initialState, new actions.CampaignLoad({ id: campaignFixture.id }));
    expect(result.loading).toBe(true);
    result = reducer(initialState, new actions.CampaignLoadFailure({ error: 'something bad happened' }));
    expect(result.loading).toBe(false);
    result = reducer(
      initialState,
      new actions.CampaignLoadSuccess({ campaignDoc: new MockHalDoc(campaignDocFixture), flightDocs: [new MockHalDoc(flightDocFixture)] })
    );
    expect(result.loading).toBe(false);
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
    let result = reducer(initialState, new actions.CampaignSave({ campaign: campaignFixture }));
    expect(result.saving).toBe(true);
    result = reducer(result, new actions.CampaignSaveFailure({ error: 'something bad happened' }));
    expect(result.saving).toBe(false);
    result = reducer(result, new actions.CampaignSaveSuccess({ campaignDoc: new MockHalDoc(campaignFixture) }));
    expect(result.saving).toBe(false);
  });

  it('should set campaign from campaign form save success', () => {
    const result = reducer(initialState, new actions.CampaignSaveSuccess({ campaignDoc: new MockHalDoc(campaignDocFixture) }));
    expect(result.localCampaign).toMatchObject(campaignFixture);
    expect(result.remoteCampaign).toMatchObject(campaignFixture);
    expect(result.changed).toBe(false);
    expect(result.valid).toBe(true);
    expect(result.loading).toBe(false);
    expect(result.saving).toBe(false);
  });
});
