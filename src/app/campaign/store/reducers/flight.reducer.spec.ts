import { MockHalDoc } from 'ngx-prx-styleguide';
import * as campaignActions from '../actions/campaign-action.creator';
import { campaignDocFixture, flightFixture, flightDocFixture, createFlightsState } from '../models/campaign-state.factory';
import { reducer, initialState, selectAll, selectEntities, selectIds } from './flight.reducer';
import { docToFlight, Flight } from '../models';

describe('Flight Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should remove flight entries for a new campaign', () => {
    const result = reducer(createFlightsState(new MockHalDoc(campaignDocFixture)).flights, new campaignActions.CampaignNew());
    expect(result).toMatchObject({ ids: [], entities: {} });
  });

  it('should set flights from campaign load success', () => {
    const result = reducer(
      initialState,
      new campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)]
      })
    );
    expect(selectIds(result).length).toBe(1);
    expect(result.entities[flightFixture.id].localFlight).toMatchObject(flightFixture);
  });

  it('should create a new flight', () => {
    const date = new Date();
    const startAt = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const endAt = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1));
    const result = reducer(initialState, new campaignActions.CampaignAddFlightWithTempId({ flightId: date.getTime(), startAt, endAt }));
    const newFlight = selectAll(result).find(flight => !flight.remoteFlight);
    expect(newFlight.localFlight.name).toContain('New Flight');
  });

  it('should duplicate a flight', () => {
    const result = reducer(initialState, new campaignActions.CampaignDupFlightWithTempId({ flightId: Date.now(), flight: flightFixture }));
    const dupFlight = selectAll(result).find(flight => flight.localFlight.name.indexOf('(Copy)') > -1);
    expect(dupFlight.localFlight.zones).toBe(flightFixture.zones);
  });

  it('should soft delete a flight', () => {
    let result = reducer(
      initialState,
      new campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)]
      })
    );
    result = reducer(result, new campaignActions.CampaignDeleteFlight({ id: flightFixture.id, softDeleted: true }));
    const flight = selectEntities(result)[flightFixture.id];
    expect(flight.softDeleted).toBe(true);
  });

  it('should update flight from form', () => {
    let result = reducer(
      initialState,
      new campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)]
      })
    );
    result = reducer(
      result,
      new campaignActions.CampaignFlightFormUpdate({
        flight: { ...flightFixture, name: 'This is a flight name' },
        changed: true,
        valid: true
      })
    );
    const flight = selectEntities(result)[flightFixture.id];
    expect(flight.localFlight.name).toBe('This is a flight name');
    expect(flight.remoteFlight.name).toBe(flightFixture.name);
  });

  it('should retain flight values not in the form update', () => {
    let result = reducer(
      initialState,
      new campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)]
      })
    );
    result = reducer(
      result,
      new campaignActions.CampaignFlightFormUpdate({
        // update only contains name
        flight: { id: flightFixture.id, name: 'This is a flight name' } as Flight,
        changed: true,
        valid: true
      })
    );
    const flight = selectEntities(result)[flightFixture.id];
    expect(flight.localFlight.name).toBe('This is a flight name');
    expect(flight.localFlight.set_inventory_uri).toBe(flightFixture.set_inventory_uri);
  });

  it('should set the goal', () => {
    let result = reducer(
      initialState,
      new campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)]
      })
    );
    result = reducer(
      result,
      new campaignActions.CampaignFlightSetGoal({ flightId: flightFixture.id, totalGoal: 999, dailyMinimum: 99, valid: true })
    );
    expect(result.entities[flightFixture.id].localFlight.totalGoal).toBe(999);
    expect(result.entities[flightFixture.id].dailyMinimum).toBe(99);
  });

  it('should update flights from campaign save action', () => {
    const deletedFlightIds = [flightDocFixture.id, flightDocFixture.id + 1];
    const updatedFlightIds = [flightDocFixture.id + 2, flightDocFixture.id + 3];
    const createdFlightIds = [flightDocFixture.id + 4, flightDocFixture.id + 5];
    const newFlightIds = [Date.now(), Date.now() + 1];
    const startAt = new Date();
    const endAt = new Date();

    const campaignDoc = new MockHalDoc(campaignDocFixture);
    const flightDocs = [
      new MockHalDoc({ ...flightDocFixture, id: deletedFlightIds[0] }),
      new MockHalDoc({ ...flightDocFixture, id: deletedFlightIds[1] }),
      new MockHalDoc({ ...flightDocFixture, id: updatedFlightIds[0] }),
      new MockHalDoc({ ...flightDocFixture, id: updatedFlightIds[1] })
    ];
    const createdFlightDocs = [
      new MockHalDoc({ ...flightDocFixture, id: createdFlightIds[0], startAt, endAt }),
      new MockHalDoc({ ...flightDocFixture, id: createdFlightIds[1], startAt, endAt })
    ];

    let result = reducer(initialState, new campaignActions.CampaignLoadSuccess({ campaignDoc, flightDocs }));
    result = reducer(result, new campaignActions.CampaignAddFlightWithTempId({ flightId: newFlightIds[0], startAt, endAt }));
    result = reducer(result, new campaignActions.CampaignAddFlightWithTempId({ flightId: newFlightIds[1], startAt, endAt }));
    result = reducer(
      result,
      new campaignActions.CampaignSaveSuccess({
        campaignDoc,
        deletedFlightDocs: { [deletedFlightIds[0]]: flightDocs[0], [deletedFlightIds[1]]: flightDocs[1] },
        updatedFlightDocs: { [updatedFlightIds[0]]: flightDocs[2], [updatedFlightIds[1]]: flightDocs[3] },
        createdFlightDocs: {
          [newFlightIds[0]]: createdFlightDocs[0],
          [newFlightIds[1]]: createdFlightDocs[1]
        }
      })
    );
    expect(result.entities[deletedFlightIds[0]]).toBeUndefined();
    expect(result.entities[deletedFlightIds[1]]).toBeUndefined();
    expect(result.entities[updatedFlightIds[0]].localFlight).toMatchObject(docToFlight(flightDocs[2]));
    expect(result.entities[updatedFlightIds[1]].localFlight).toMatchObject(docToFlight(flightDocs[3]));
    expect(result.entities[newFlightIds[0]]).toBeUndefined();
    expect(result.entities[newFlightIds[1]]).toBeUndefined();
    expect(result.entities[createdFlightIds[0]].localFlight).toMatchObject(docToFlight(createdFlightDocs[0]));
    expect(result.entities[createdFlightIds[1]].localFlight).toMatchObject(docToFlight(createdFlightDocs[1]));
  });
});
