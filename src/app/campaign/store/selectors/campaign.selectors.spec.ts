import * as campaignStateFactory from '../reducers/campaign-state.factory';
import * as campaignSelectors from './campaign.selectors';

describe('Campaign Selectors', () => {
  it('should select campaign state', () => {
    const state = campaignStateFactory.createState();
    expect(campaignSelectors.selectCampaign.projector(state)).toBeDefined();
  });

  it('should select local campaign', () => {
    const state = campaignStateFactory.createCampaignState().campaign;
    expect(campaignSelectors.selectLocalCampaign.projector(state)).toBe(campaignStateFactory.campaignFixture);
  });

  it('should select campaign doc', () => {
    const state = campaignStateFactory.createCampaignState().campaign;
    expect(campaignSelectors.selectCampaignDoc.projector(state)).toBeDefined();
    expect(campaignSelectors.selectCampaignDoc.projector(state).id).toBe(campaignStateFactory.campaignFixture.id);
  });

  it('should select campaign loading', () => {
    const state = campaignStateFactory.createCampaignState().campaign;
    expect(campaignSelectors.selectCampaignLoading.projector(state)).toBe(state.loading);
  });

  it('should select campaign saving', () => {
    const state = campaignStateFactory.createCampaignState().campaign;
    expect(campaignSelectors.selectCampaignLoading.projector(state)).toBe(state.saving);
  });
});
