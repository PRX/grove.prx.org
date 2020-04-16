import * as campaignStateFactory from '../models/campaign-state.factory';
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
      campaignStateFactory.createRouterState().router.state.flightId
    );
    expect(flight).toBeDefined();
  });

  it('should select routed local flight', () => {
    const flight = flightSelectors.selectRoutedLocalFlight.projector(
      campaignStateFactory.createFlightsState(new MockHalDoc(campaignStateFactory.campaignDocFixture)).flights.entities[
        campaignStateFactory.flightFixture.id
      ]
    );
    expect(flight).toBeDefined();
  });

  it('should select routed local flight zones', () => {
    const zones = flightSelectors.selectRoutedLocalFlightZones.projector(campaignStateFactory.flightFixture);
    expect(zones).toEqual(campaignStateFactory.flightFixture.zones.map(z => z.id));
  });

  it('should select current/routed local flight inventory uri', () => {
    const uri = flightSelectors.selectCurrentInventoryUri.projector(campaignStateFactory.flightFixture);
    expect(uri).toEqual(campaignStateFactory.flightFixture.set_inventory_uri);
  });

  it('should select routed flight deleted', () => {
    const flightState = campaignStateFactory.createFlightsState(new MockHalDoc(campaignStateFactory.campaignDocFixture)).flights.entities[
      campaignStateFactory.flightFixture.id
    ];
    const softDeleted = flightSelectors.selectRoutedFlightDeleted.projector(flightState);
    expect(softDeleted).toEqual(flightState.softDeleted);
  });

  it('should select routed flight changed', () => {
    const flightState = campaignStateFactory.createFlightsState(new MockHalDoc(campaignStateFactory.campaignDocFixture)).flights.entities[
      campaignStateFactory.flightFixture.id
    ];
    const changed = flightSelectors.selectRoutedFlightChanged.projector(flightState);
    expect(changed).toEqual(flightState.changed);
  });

  it('should select flight doc by id', () => {
    const state = campaignStateFactory.createFlightsState(new MockHalDoc(campaignStateFactory.campaignDocFixture));
    const doc = flightSelectors.selectFlightDocById.projector(state.flights.entities, { id: campaignStateFactory.flightFixture.id });
    expect(doc).toBeDefined();
    expect(doc.id).toEqual(campaignStateFactory.flightFixture.id);
  });
});
