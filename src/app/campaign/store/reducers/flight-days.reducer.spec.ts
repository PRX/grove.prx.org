import { MockHalDoc } from 'ngx-prx-styleguide';
import * as campaignActions from '../actions/campaign-action.creator';
import * as flightPreviewActions from '../actions/flight-preview-action.creator';
import { campaignDocFixture, flightDocFixture, createFlightDaysState, flightDaysDocFixture } from '../models/campaign-state.factory';
import { reducer, initialState, selectIds } from './flight-days.reducer';
import { docToFlightDays } from '../models';
import * as moment from 'moment';

describe('Flight Days/Preview Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should remove flight days entries for a new campaign', () => {
    const result = reducer(createFlightDaysState().flightDays, new campaignActions.CampaignNew({}));
    expect(result).toMatchObject({ ids: [], entities: {} });
  });

  it('should set flight days from campaign load success', () => {
    const result = reducer(
      initialState,
      new campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    expect(selectIds(result).length).toBe(1);
    expect(result.entities[flightDocFixture.id].days).toMatchObject(
      docToFlightDays(new MockHalDoc(flightDocFixture), flightDocFixture.id, flightDaysDocFixture).days
    );
  });

  it('should update flight days from campaign save action', () => {
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
    const flightDaysDocs = {
      [deletedFlightIds[0]]: flightDaysDocFixture,
      [deletedFlightIds[1]]: flightDaysDocFixture,
      [updatedFlightIds[0]]: flightDaysDocFixture,
      [updatedFlightIds[1]]: flightDaysDocFixture
    };

    let result = reducer(initialState, new campaignActions.CampaignLoadSuccess({ campaignDoc, flightDocs, flightDaysDocs }));
    result = reducer(
      result,
      new campaignActions.CampaignSaveSuccess({
        campaignDoc,
        deletedFlightDocs: { [deletedFlightIds[0]]: flightDocs[0], [deletedFlightIds[1]]: flightDocs[1] },
        updatedFlightDocs: { [updatedFlightIds[0]]: flightDocs[2], [updatedFlightIds[1]]: flightDocs[3] },
        updatedFlightDaysDocs: { [updatedFlightIds[0]]: flightDaysDocFixture, [updatedFlightIds[1]]: flightDaysDocFixture },
        createdFlightDocs: {
          [newFlightIds[0]]: createdFlightDocs[0],
          [newFlightIds[1]]: createdFlightDocs[1]
        },
        createdFlightDaysDocs: {
          [createdFlightIds[0]]: flightDaysDocFixture,
          [createdFlightIds[1]]: flightDaysDocFixture
        }
      })
    );
    expect(result.entities[deletedFlightIds[0]]).toBeUndefined();
    expect(result.entities[deletedFlightIds[1]]).toBeUndefined();
    expect(result.entities[updatedFlightIds[0]].days).toMatchObject(
      docToFlightDays(new MockHalDoc(flightDocFixture), updatedFlightIds[0], flightDaysDocFixture).days
    );
    expect(result.entities[updatedFlightIds[1]].days).toMatchObject(
      docToFlightDays(new MockHalDoc(flightDocFixture), updatedFlightIds[1], flightDaysDocFixture).days
    );
    expect(result.entities[newFlightIds[0]]).toBeUndefined();
    expect(result.entities[newFlightIds[1]]).toBeUndefined();
    expect(result.entities[createdFlightIds[0]].days).toMatchObject(
      docToFlightDays(new MockHalDoc(flightDocFixture), createdFlightIds[0], flightDaysDocFixture).days
    );
    expect(result.entities[createdFlightIds[1]].days).toMatchObject(
      docToFlightDays(new MockHalDoc(flightDocFixture), createdFlightIds[1], flightDaysDocFixture).days
    );
  });

  it('should update flight days from flight preview create success', () => {
    let result = reducer(
      initialState,
      new campaignActions.CampaignLoadSuccess({
        campaignDoc: new MockHalDoc(campaignDocFixture),
        flightDocs: [new MockHalDoc(flightDocFixture)],
        flightDaysDocs: { [flightDocFixture.id]: flightDaysDocFixture }
      })
    );
    result = reducer(
      result,
      new flightPreviewActions.FlightPreviewCreateSuccess({
        flight: flightDocFixture,
        status: 'ok',
        statusMessage: null,
        flightDaysDocs: flightDaysDocFixture,
        flightDoc: new MockHalDoc(flightDocFixture),
        campaignDoc: new MockHalDoc(campaignDocFixture)
      })
    );
  });

  it('should set flight preview error from flight preview create failure', () => {
    const result = reducer(
      initialState,
      new flightPreviewActions.FlightPreviewCreateFailure({
        flight: flightDocFixture,
        error: { body: { status: 422, message: 'no allocatable days' } }
      })
    );
    expect(result.entities[flightDocFixture.id].previewError.body.message).toEqual('no allocatable days');
  });
});
