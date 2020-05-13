import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes } from '../actions/action.types';
import { CampaignActions } from '../actions/campaign-action.creator';
import { FlightPreviewActions } from '../actions/flight-preview-action.creator';
import { docToFlightDays, getFlightDaysId, FlightDays } from '../models';

export interface State extends EntityState<FlightDays> {
  preview: boolean;
}

export const adapter: EntityAdapter<FlightDays> = createEntityAdapter<FlightDays>({ selectId: getFlightDaysId });

export const initialState: State = adapter.getInitialState({
  preview: false,
  previewError: undefined
});

export function reducer(state = initialState, action: CampaignActions | FlightPreviewActions): State {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_NEW:
    case ActionTypes.CAMPAIGN_LOAD: {
      return adapter.removeAll(state);
    }
    case ActionTypes.CAMPAIGN_LOAD_SUCCESS: {
      return adapter.addAll(
        action.payload.flightDocs.map(flightDoc => docToFlightDays(flightDoc, flightDoc.id, action.payload.flightDaysDocs[flightDoc.id])),
        { ...state, preview: false, previewError: null }
      );
    }
    case ActionTypes.CAMPAIGN_SAVE_SUCCESS: {
      let newState = { ...state, preview: false, previewError: null };
      const { deletedFlightDocs, updatedFlightDocs, updatedFlightDaysDocs, createdFlightDocs, createdFlightDaysDocs } = action.payload;
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
    }
    case ActionTypes.CAMPAIGN_FLIGHT_PREVIEW_CREATE_SUCCESS: {
      const { flight, flightDoc, flightDaysDocs } = action.payload;
      return adapter.upsertOne(docToFlightDays(flightDoc, flight.id, flightDaysDocs), { ...state, preview: true, previewError: null });
    }
    case ActionTypes.CAMPAIGN_FLIGHT_PREVIEW_CREATE_FAILURE: {
      const { error: previewError, flight } = action.payload;
      const days = state.entities[flight.id] ? state.entities[flight.id].days : [];
      return adapter.upsertOne({ flightId: flight.id, days, previewError }, { ...state, preview: true });
    }
    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
