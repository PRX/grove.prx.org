import * as campaignStateFactory from '../models/campaign-state.factory';
import * as availabilitySelectors from './availability.selectors';

describe('Availability Selectors', () => {
  it('should select availability state', () => {
    const state = campaignStateFactory.createCampaignStoreState();
    expect(availabilitySelectors.selectAvailabilityState.projector(state)).toBeDefined();
  });

  it('should select availability entities', () => {
    const entities = availabilitySelectors.selectAvailabilityEntities.projector(
      campaignStateFactory.createAvailabilityState().availability
    );
    expect(entities).toEqual(campaignStateFactory.availabilityEntities);
  });

  it('should select availability entities by routed flight id and zones', () => {
    const flight = campaignStateFactory.flightFixture;
    const entities = campaignStateFactory.createAvailabilityState().availability.entities;
    expect(availabilitySelectors.selectRoutedFlightAvailabilityEntities.projector(flight, entities)).toBeDefined();
    expect(availabilitySelectors.selectRoutedFlightAvailabilityEntities.projector({ ...flight, zones: ['n/a'] }, entities)).toEqual({});
  });

  it('should select availability error', () => {
    const error = availabilitySelectors.selectAvailabilityError.projector({
      error: { body: { status: 500, message: 'error occured' } }
    });
    expect(error).toMatchObject(error);
  });
});
