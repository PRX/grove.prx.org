import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes } from '../actions/action.types';
import { CampaignActions } from '../actions/campaign-action.creator';
import { docToFlightDays, getFlightDaysId, FlightDays } from '../models';

export interface State extends EntityState<FlightDays> {
  // additional entities state properties for the collection
  campaignId?: number;
}

export const adapter: EntityAdapter<FlightDays> = createEntityAdapter<FlightDays>({ selectId: getFlightDaysId });

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(state = initialState, action: CampaignActions): State {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_NEW:
    case ActionTypes.CAMPAIGN_LOAD: {
      return { ...adapter.removeAll(state), campaignId: undefined };
    }
    case ActionTypes.CAMPAIGN_LOAD_SUCCESS: {
      return adapter.addAll(
        action.payload.flightDocs.map(flightDoc => docToFlightDays(flightDoc, action.payload.flightDaysDocs[flightDoc.id])),
        state
      );
    }
    case ActionTypes.CAMPAIGN_SAVE_SUCCESS: {
      let newState = state;
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
            return { id: flightId, changes: docToFlightDays(updatedFlightDocs[flightId], updatedFlightDaysDocs[flightId]) };
          }),
          newState
        );
      }
      if (createdFlightDaysDocs) {
        const newFlightIds = Object.values(createdFlightDaysDocs).map(id => +id);
        newState = adapter.addMany(
          newFlightIds.map(flightId => docToFlightDays(createdFlightDocs[flightId], createdFlightDaysDocs[flightId])),
          newState
        );
      }
      return newState;
    }
    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
