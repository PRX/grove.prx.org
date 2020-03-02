import * as campaignStateFactory from '../reducers/campaign-state.factory';
import * as flightSelectors from './flight.selectors';
import { MockHalDoc } from 'ngx-prx-styleguide';

describe('Flight Selectors', () => {
  it('should select flights state', () => {
    const state = campaignStateFactory.createCampaignStoreState();
    expect(flightSelectors.selectFlightsState.projector(state)).toBeDefined();
  });

  it('should select routed flight', () => {
    const flight = flightSelectors.selectRoutedFlight.projector(
      campaignStateFactory.createCampaignStoreState().flights.entities,
      campaignStateFactory.createRouterState().router.state
    );
    expect(flight).toBeDefined();
  });

  it('should select routed local flight', () => {
    const flight = flightSelectors.selectRoutedLocalFlight.projector(
      campaignStateFactory.createFlightsState().flights.entities[campaignStateFactory.flightFixture.id]
    );
    expect(flight).toBeDefined();
  });

  it('should select routed flight doc', () => {
    const doc = flightSelectors.selectRoutedFlightDoc.projector({
      ...campaignStateFactory.createFlightsState().flights.entities[campaignStateFactory.flightFixture.id],
      doc: new MockHalDoc(campaignStateFactory.flightDocFixture)
    });
    expect(doc).toBeDefined();
  });
});
