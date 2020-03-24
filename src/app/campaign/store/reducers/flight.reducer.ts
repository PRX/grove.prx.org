import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes } from '../actions/action.types';
import { CampaignActions } from '../actions/campaign-action.creator';
import { docToFlight, Flight, FlightState } from '../models';

export interface State extends EntityState<FlightState> {
  // additional entities state properties for the collection
  campaignId?: number;
}

export const adapter: EntityAdapter<FlightState> = createEntityAdapter<FlightState>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(state = initialState, action: CampaignActions): State {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_NEW: {
      return { ...adapter.removeAll(state), campaignId: undefined };
    }
    case ActionTypes.CAMPAIGN_LOAD: {
      return {
        ...adapter.removeAll(state),
        ...(action.payload && { campaignId: action.payload.id })
      };
    }
    case ActionTypes.CAMPAIGN_LOAD_SUCCESS: {
      const flights = action.payload.flightDocs.map(doc => {
        const flight = docToFlight(doc);
        return {
          id: doc.id,
          doc,
          localFlight: flight,
          remoteFlight: flight,
          changed: false,
          valid: true
        };
      });
      return adapter.addAll(flights, state);
    }
    case ActionTypes.CAMPAIGN_ADD_FLIGHT_WITH_TEMP_ID: {
      const { flightId: id, startAt, endAt } = action.payload;
      const initialFlightState: FlightState = {
        id,
        localFlight: {
          id,
          name: 'New Flight ' + (state.ids.length + 1),
          startAt,
          endAt,
          totalGoal: null,
          zones: [],
          set_inventory_uri: null
        },
        changed: false,
        valid: true
      };
      return adapter.addOne(initialFlightState, state);
    }
    case ActionTypes.CAMPAIGN_DUP_FLIGHT_WITH_TEMP_ID: {
      const { flight, flightId: id } = action.payload;
      const localFlight: Flight = { ...flight, id, name: `${flight.name} (Copy)` };
      return adapter.addOne({ id, localFlight, changed: true, valid: true }, state);
    }
    case ActionTypes.CAMPAIGN_DELETE_FLIGHT: {
      const { id, softDeleted } = action.payload;
      return adapter.updateOne({ id, changes: { softDeleted } }, state);
    }
    case ActionTypes.CAMPAIGN_FLIGHT_FORM_UPDATE: {
      const { flight: localFlight, changed, valid } = action.payload;
      return adapter.updateOne({ id: localFlight.id, changes: { localFlight, changed, valid } }, state);
    }
    case ActionTypes.CAMPAIGN_FLIGHT_SET_GOAL: {
      const { flightId: id, totalGoal, dailyMinimum, valid } = action.payload;
      return adapter.updateOne(
        { id, changes: { localFlight: { ...state.entities[id].localFlight, totalGoal }, dailyMinimum, changed: true, valid } },
        state
      );
    }
    case ActionTypes.CAMPAIGN_SAVE_SUCCESS: {
      let newState = state;
      const { deletedFlightDocs, updatedFlightDocs, createdFlightDocs } = action.payload;
      if (deletedFlightDocs) {
        newState = adapter.removeMany(Object.keys(deletedFlightDocs), newState);
      }
      if (updatedFlightDocs) {
        const updatedFlightIds = Object.keys(updatedFlightDocs);
        newState = adapter.updateMany(
          updatedFlightIds.map(id => {
            const doc = docToFlight(updatedFlightDocs[id]);
            return { id, changes: { localFlight: doc, remoteFlight: doc, changed: false } };
          }),
          newState
        );
      }
      if (createdFlightDocs) {
        const newFlightIds = Object.keys(createdFlightDocs);
        newState = adapter.removeMany(newFlightIds, newState);
        newState = adapter.addMany(
          newFlightIds.map(newId => {
            const doc = docToFlight(createdFlightDocs[newId]);
            return { id: createdFlightDocs[newId].id, localFlight: doc, remoteFlight: doc, changed: false, valid: true };
          }),
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
