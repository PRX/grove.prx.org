import { MockHalDoc } from 'ngx-prx-styleguide';
import * as campaignActions from '../actions/campaign-action.creator';
import * as flightPreviewActions from '../actions/flight-preview-action.creator';
import {
  campaignDocFixture,
  flightFixture,
  flightDocFixture,
  createFlightsState,
  campaignFixture,
  flightDaysDocFixture
} from '../models/campaign-state.factory';
import { reducer, initialState, selectAll, selectEntities, selectIds } from './flight.reducer';
import { docToFlight, Flight } from '../models';
import * as moment from 'moment';

describe('Flight Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should remove flight entries for a new campaign', () => {
    const result = reducer(createFlightsState(new MockHalDoc(campaignDocFixture)).flights, campaignActions.CampaignNew());
    expect(result).toMatchObject({ ids: [], entities: {} });
  });

  it('should set flights from campaign load success', () => {
    const result = reducer(
      initialState,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    expect(selectIds(result).length).toBe(1);
    expect(result.entities[flightFixture.id].localFlight).toMatchObject(flightFixture);
  });

  it('should ensure nullable fields are on model', () => {
    const { totalGoal, dailyMinimum, contractGoal, contractEndAt, contractEndAtFudged, contractStartAt, ...flight } = flightDocFixture;
    const result = reducer(
      initialState,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flight)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    expect(result.entities[flightFixture.id].localFlight.totalGoal).toBeNull();
    expect(result.entities[flightFixture.id].localFlight.dailyMinimum).toBeNull();
    expect(result.entities[flightFixture.id].localFlight.contractGoal).toBeNull();
    expect(result.entities[flightFixture.id].localFlight.contractEndAt).toBeNull();
    expect(result.entities[flightFixture.id].localFlight.contractEndAtFudged).toBeNull();
    expect(result.entities[flightFixture.id].localFlight.contractStartAt).toBeNull();
    expect(result.entities[flightFixture.id].localFlight.zones[0].hasOwnProperty('url')).toBeTruthy();
  });

  it('should create a new flight', () => {
    const result = reducer(initialState, campaignActions.CampaignAddFlight({ campaignId: campaignFixture.id }));
    const newFlightState = selectAll(result).find(flight => !flight.remoteFlight);
    expect(newFlightState.localFlight.name).toContain('New Flight');
    expect(newFlightState.valid).toBeFalsy();
  });

  it('should fudge the end date by -1 day to appear as if the flight ends on the date it is set to stop serving', () => {
    const contractEndAt = moment.utc();
    let result = reducer(
      initialState,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc({ ...flightDocFixture, contractEndAt })],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    expect(result.entities[flightFixture.id].localFlight.endAtFudged.valueOf()).toEqual(
      moment
        .utc(flightFixture.endAt.valueOf())
        .subtract(1, 'days')
        .valueOf()
    );
    expect(result.entities[flightFixture.id].localFlight.contractEndAtFudged.valueOf()).toEqual(
      moment
        .utc(contractEndAt)
        .subtract(1, 'days')
        .valueOf()
    );

    result = reducer(initialState, campaignActions.CampaignAddFlight({ campaignId: campaignFixture.id }));
    const newFlight = selectAll(result).find(flight => !flight.remoteFlight);
    expect(newFlight.localFlight.endAtFudged.valueOf()).toEqual(
      moment
        .utc(newFlight.localFlight.endAt.valueOf())
        .subtract(1, 'days')
        .valueOf()
    );
  });

  it('should duplicate a flight', () => {
    const result = reducer(
      initialState,
      campaignActions.CampaignDupFlight({ campaignId: campaignFixture.id, flightId: Date.now(), flight: flightFixture })
    );
    const dupFlight = selectAll(result).find(flight => flight.localFlight.name.indexOf('Copy of') > -1);
    expect(dupFlight.localFlight.zones).toBe(flightFixture.zones);
  });

  it('should soft delete a flight', () => {
    let result = reducer(
      initialState,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    result = reducer(result, campaignActions.CampaignDeleteFlight({ id: flightFixture.id, softDeleted: true }));
    const flight = selectEntities(result)[flightFixture.id];
    expect(flight.softDeleted).toBe(true);
  });

  it('should update flight from form', () => {
    let result = reducer(
      initialState,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    result = reducer(
      result,
      campaignActions.CampaignFlightFormUpdate({
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
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    result = reducer(
      result,
      campaignActions.CampaignFlightFormUpdate({
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

  it('should delete temporary softDeleted flights from save action', () => {
    const flightId = Date.now();
    let state = reducer(initialState, campaignActions.CampaignAddFlight({ campaignId: campaignFixture.id, flightId }));
    state = reducer(state, campaignActions.CampaignAddFlight({ campaignId: campaignFixture.id, flightId: flightId + 1 }));
    state = reducer(
      state,
      campaignActions.CampaignSave({
        campaign: campaignFixture,
        campaignDoc: new MockHalDoc(campaignDocFixture),
        deletedFlights: [],
        updatedFlights: [],
        createdFlights: [],
        tempDeletedFlights: [state.entities[flightId].localFlight]
      })
    );
    expect(state.entities[flightId]).toBeUndefined();
    expect(state.entities[flightId + 1]).toBeDefined();
  });

  it('should update flights from campaign save action', () => {
    const deletedFlightIds = [flightDocFixture.id, flightDocFixture.id + 1];
    const updatedFlightIds = [flightDocFixture.id + 2, flightDocFixture.id + 3];
    const createdFlightIds = [flightDocFixture.id + 4, flightDocFixture.id + 5];
    const newFlightIds = [Date.now(), Date.now() + 1];
    const startAt = moment.utc();
    const endAt = moment.utc();

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
    const flightDaysDocs = { [flightDocFixture.id]: flightDaysDocFixture };

    let result = reducer(initialState, campaignActions.CampaignLoadSuccess({ campaignDoc, flightDocs, flightDaysDocs }));
    result = reducer(
      result,
      campaignActions.CampaignAddFlight({ campaignId: campaignFixture.id, flightId: newFlightIds[0], startAt, endAt })
    );
    result = reducer(
      result,
      campaignActions.CampaignAddFlight({ campaignId: campaignFixture.id, flightId: newFlightIds[1], startAt, endAt })
    );
    result = reducer(
      result,
      campaignActions.CampaignSaveSuccess({
        campaignDoc,
        deletedFlightDocs: { [deletedFlightIds[0]]: flightDocs[0], [deletedFlightIds[1]]: flightDocs[1] },
        updatedFlightDocs: { [updatedFlightIds[0]]: flightDocs[2], [updatedFlightIds[1]]: flightDocs[3] },
        updatedFlightDaysDocs: {},
        createdFlightDocs: {
          [newFlightIds[0]]: createdFlightDocs[0],
          [newFlightIds[1]]: createdFlightDocs[1]
        },
        createdFlightDaysDocs: {}
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

  it('should set flight state from campaign duplicate from form', () => {
    const timestamp = Date.now();
    // load a flight into the flight form state
    let state = reducer(
      initialState,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    // duplicate that flight
    state = reducer(
      state,
      campaignActions.CampaignDupFromForm({
        campaign: campaignFixture,
        flights: [flightFixture],
        timestamp
      })
    );
    expect(state.campaignId).toBeUndefined();
    expect(state.ids.length).toEqual(1);
    expect(state.entities[flightFixture.id]).toBeUndefined();
    expect(state.entities[timestamp]).toBeDefined();
    expect(state.entities[timestamp].localFlight.id).toEqual(timestamp);
    expect(state.entities[timestamp].localFlight.createdAt).toBeUndefined();
  });

  it('should update flight state from campaign duplicate by id', () => {
    const timestamp = Date.now();
    // starting from intialState, duplicate a flight by id where the campaign and flights are provided by an effect success action
    const state = reducer(
      initialState,
      campaignActions.CampaignDupByIdSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        timestamp
      })
    );
    expect(state.campaignId).toBeUndefined();
    expect(state.ids.length).toEqual(1);
    expect(state.entities[flightFixture.id]).toBeUndefined();
    expect(state.entities[timestamp]).toBeDefined();
    expect(state.entities[timestamp].localFlight.id).toEqual(timestamp);
    expect(state.entities[timestamp].localFlight.createdAt).toBeUndefined();
  });

  it('should update the flight allocation status/message from preview', () => {
    let result = reducer(
      initialState,
      campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    result = reducer(
      result,
      flightPreviewActions.FlightPreviewCreateSuccess({
        flight: flightFixture,
        allocationStatus: 'error',
        allocationStatusMessage: 'something bad',
        flightDaysDocs: []
      })
    );
    expect(result.entities[flightFixture.id].localFlight).toMatchObject(flightFixture);
    expect(result.entities[flightFixture.id].localFlight.allocationStatus).toBe('error');
    expect(result.entities[flightFixture.id].localFlight.allocationStatusMessage).toBe('something bad');
  });
});
