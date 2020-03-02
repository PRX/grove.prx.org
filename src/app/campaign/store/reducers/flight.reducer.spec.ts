import { MockHalDoc } from 'ngx-prx-styleguide';
import * as actions from '../actions';
import { campaignDocFixture, flightFixture, flightDocFixture, createFlightsState } from './campaign-state.factory';
import { reducer, initialState, selectAll, selectEntities, selectIds } from './flight.reducer';

describe('Flight Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should remove flight entries for a new campaign', () => {
    const result = reducer(createFlightsState().flights, new actions.CampaignNew());
    expect(result).toMatchObject({ ids: [], entities: {} });
  });

  it('should set flights from campaign load success', () => {
    const result = reducer(
      initialState,
      new actions.CampaignLoadSuccess({ campaignDoc: new MockHalDoc(campaignDocFixture), flightDocs: [new MockHalDoc(flightDocFixture)] })
    );
    expect(selectIds(result).length).toBe(1);
    expect(result.entities[flightFixture.id].localFlight).toMatchObject(flightFixture);
  });

  it('should create a new flight', () => {
    const result = reducer(initialState, new actions.CampaignAddFlight());
    const newFlight = selectAll(result).find(flight => !flight.remoteFlight);
    expect(newFlight.localFlight.name).toContain('New Flight');
  });

  it('should duplicate a flight', () => {
    const result = reducer(initialState, new actions.CampaignDupFlight({ flight: flightFixture }));
    const dupFlight = selectAll(result).find(flight => flight.localFlight.name.indexOf('(Copy)') > -1);
    expect(dupFlight.localFlight.zones).toBe(flightFixture.zones);
  });

  it('should soft delete a flight', () => {
    let result = reducer(
      initialState,
      new actions.CampaignLoadSuccess({ campaignDoc: new MockHalDoc(campaignDocFixture), flightDocs: [new MockHalDoc(flightDocFixture)] })
    );
    result = reducer(result, new actions.CampaignDeleteFlight({ id: flightFixture.id, softDeleted: true }));
    const flight = selectEntities(result)[flightFixture.id];
    expect(flight.softDeleted).toBe(true);
  });

  it('should update flight from form', () => {
    let result = reducer(
      initialState,
      new actions.CampaignLoadSuccess({ campaignDoc: new MockHalDoc(campaignDocFixture), flightDocs: [new MockHalDoc(flightDocFixture)] })
    );
    result = reducer(
      result,
      new actions.CampaignFlightFormUpdate({
        id: flightFixture.id,
        flight: { ...flightFixture, name: 'This is a flight name' },
        changed: true,
        valid: true
      })
    );
    const flight = selectEntities(result)[flightFixture.id];
    expect(flight.localFlight.name).toBe('This is a flight name');
    expect(flight.remoteFlight.name).toBe(flightFixture.name);
  });
});
