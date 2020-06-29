import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as campaignActions from '../actions/campaign-action.creator';
import * as flightPreviewActions from '../actions/flight-preview-action.creator';
import { docToFlightDays, getFlightDaysId, FlightDays } from '../models';

export type State = EntityState<FlightDays>;

export const adapter: EntityAdapter<FlightDays> = createEntityAdapter<FlightDays>({ selectId: getFlightDaysId });

export const initialState: State = adapter.getInitialState({});

// tslint:disable-next-line: variable-name
const _reducer = createReducer(
  initialState,
  on(campaignActions.CampaignNew, campaignActions.CampaignLoad, (state, action) => adapter.removeAll(state)),
  on(campaignActions.CampaignLoadSuccess, (state, action) =>
    adapter.addAll(
      action.flightDocs.map(flightDoc => docToFlightDays(flightDoc, flightDoc.id, action.flightDaysDocs[flightDoc.id])),
      state
    )
  ),
  on(campaignActions.CampaignSaveSuccess, (state, action) => {
    let newState = state;
    const { deletedFlightDocs, updatedFlightDocs, updatedFlightDaysDocs, createdFlightDocs, createdFlightDaysDocs } = action;
    if (deletedFlightDocs) {
      newState = adapter.removeMany(
        Object.keys(deletedFlightDocs).map(id => +id),
        newState
      );
    }
    if (updatedFlightDaysDocs) {
      const updatedFlightIds = Object.keys(updatedFlightDaysDocs).map(id => +id);
      newState = adapter.updateMany(
        updatedFlightIds.map(flightId => {
          return { id: flightId, changes: docToFlightDays(updatedFlightDocs[flightId], flightId, updatedFlightDaysDocs[flightId]) };
        }),
        newState
      );
    }
    if (createdFlightDaysDocs) {
      const newFlightIds = Object.keys(createdFlightDaysDocs).map(id => +id);
      newState = adapter.addMany(
        newFlightIds.map(flightId => docToFlightDays(createdFlightDocs[flightId], flightId, createdFlightDaysDocs[flightId])),
        newState
      );
    }
    return newState;
  }),
  on(flightPreviewActions.FlightPreviewCreate, (state, action) => {
    return adapter.updateOne({ id: action.flight.id, changes: { loading: true } }, state);
  }),
  on(flightPreviewActions.FlightPreviewCreateSuccess, (state, action) => {
    const { flight, flightDoc, flightDaysDocs } = action;
    return adapter.upsertOne(docToFlightDays(flightDoc, flight.id, flightDaysDocs, true), state);
  }),
  on(flightPreviewActions.FlightPreviewCreateFailure, (state, action) => {
    const { error: previewError, flight } = action;
    const days = state.entities[flight.id] ? state.entities[flight.id].days : [];
    return adapter.upsertOne({ flightId: flight.id, days, loading: false, preview: false, previewError }, state);
  })
);

export function reducer(state, action) {
  return _reducer(state, action);
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
