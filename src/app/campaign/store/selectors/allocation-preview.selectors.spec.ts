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

  it('should select allocation preview entities by routed flight id', () => {
    const state = campaignStateFactory.createAllocationPreviewState().allocationPreview;
    const flightId = campaignStateFactory.flightFixture.id;
    expect(allocationPreviewSelectors.selectRoutedFlightAllocationPreviewEntities.projector(state, flightId, state.entities)).toBeDefined();
    expect(allocationPreviewSelectors.selectRoutedFlightAllocationPreviewEntities.projector(state, Date.now(), state.entities)).toBeFalsy();
  });

  it('should select allocation preview error', () => {
    const error = allocationPreviewSelectors.selectAllocationPreviewError.projector({
      error: { body: { status: 422, message: 'no allocatable days' } }
    });
    expect(error).toMatchObject(error);
  });

  it('should select allocation preview error by routed flight id', () => {
    const state = campaignStateFactory.createAllocationPreviewState().allocationPreview;
    const flightId = campaignStateFactory.flightFixture.id;
    const error = { body: { status: 422, message: 'no allocatable days' } };
    expect(allocationPreviewSelectors.selectRoutedFlightAllocationPreviewEntities.projector(state, flightId, error)).toBeDefined();
    expect(allocationPreviewSelectors.selectRoutedFlightAllocationPreviewEntities.projector(state, Date.now(), error)).toBeFalsy();
  });
});
