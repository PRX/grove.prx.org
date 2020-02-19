import * as campaignStateFactory from '../reducers/campaign-state.factory';
import * as campaignSelectors from './campaign.selectors';

describe('Campaign Selectors', () => {
  it('should select campaign state', () => {
    const state = campaignStateFactory.createState();
    expect(campaignSelectors.selectCampaign.projector(state)).toBeDefined();
  });

  it('should select local campaign', () => {
    const state = campaignStateFactory.createState();
    expect(campaignSelectors.selectCampaign.projector(state).localCampaign).toBe(campaignStateFactory.campaignFixture);
  });
});
