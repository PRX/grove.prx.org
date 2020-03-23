import * as campaignStateFactory from '../models/campaign-state.factory';
import * as allocationPreviewSelectors from './allocation-preview.selectors';
import * as allocationPreviewReducer from '../reducers/allocation-preview.reducer';

describe('Allocation Preview Selectors', () => {
  it('should select allocation preview state', () => {
    const state = campaignStateFactory.createCampaignStoreState();
    expect(allocationPreviewSelectors.selectAllocationPreviewState.projector(state)).toBeDefined();
  });

  it('should select allocation preview entities', () => {
    const entities = allocationPreviewSelectors.selectAllocationPreviewEntities.projector(
      campaignStateFactory.createAllocationPreviewState().allocationPreview
    );
    expect(entities).toBeDefined();
    expect(entities[allocationPreviewReducer.selectId(campaignStateFactory.allocationPreviewFixture[0])]).toEqual(
      campaignStateFactory.allocationPreviewFixture[0]
    );
  });

  it('should select allocation preview error', () => {
    const error = allocationPreviewSelectors.selectAllocationPreviewError.projector({
      error: { status: 422, message: 'no allocatable days' }
    });
    expect(error.status).toEqual(422);
  });
});
