import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes } from '../actions/action.types';
import { CampaignActions } from '../actions/campaign-action.creator';
import { docToFlight, duplicateFlight, Flight, FlightState, getFlightId } from '../models';

export interface State extends EntityState<FlightState> {
  // additional entities state properties for the collection
  campaignId?: number;
}

export const adapter: EntityAdapter<FlightState> = createEntityAdapter<FlightState>({ selectId: getFlightId });

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(state = initialState, action: CampaignActions): State {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_NEW: {
      return { ...adapter.removeAll(state), campaignId: undefined };
    }
    case ActionTypes.CAMPAIGN_DUP_FROM_FORM: {
      return adapter.addAll(
        action.payload.flights.map((flight, i) => {
          const tempId = action.payload.timestamp + i;
          return {
            id: tempId,
            localFlight: duplicateFlight(flight, tempId),
            changed: true,
            valid: false
          };
        }),
        state
      );
    }
    case ActionTypes.CAMPAIGN_DUP_BY_ID_SUCCESS: {
      const flights = action.payload.flightDocs.map((doc, i) => {
        const tempId = action.payload.timestamp + i;
        return {
          id: tempId,
          localFlight: duplicateFlight(docToFlight(doc), tempId),
          changed: true,
          valid: false
        };
      });
      return adapter.addAll(flights, state);
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
          doc,
          localFlight: flight,
          remoteFlight: flight,
          changed: false,
          valid: true
        };
      });
      return adapter.addAll(flights, state);
    }
    case ActionTypes.CAMPAIGN_ADD_FLIGHT: {
      const { flightId: id, startAt, endAt } = action.payload;
      const initialFlightState: FlightState = {
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
    case ActionTypes.CAMPAIGN_DUP_FLIGHT: {
      const { flight, flightId } = action.payload;
      const localFlight: Flight = duplicateFlight({ ...flight, name: `${flight.name} (Copy)` }, flightId);
      return adapter.addOne({ localFlight, changed: true, valid: true }, state);
    }
    case ActionTypes.CAMPAIGN_DELETE_FLIGHT: {
      const { id, softDeleted } = action.payload;
      return adapter.updateOne({ id, changes: { softDeleted } }, state);
    }
    case ActionTypes.CAMPAIGN_FLIGHT_FORM_UPDATE: {
      const { flight, changed, valid } = action.payload;
      const localFlight = { ...(state.entities[flight.id] && state.entities[flight.id].localFlight), ...flight };
      return adapter.updateOne(
        {
          id: flight.id,
          changes: {
            localFlight,
            // changed _should_ always be true on form updates
            // however, we're seeing updates emit from the form when the form is not dirty (changed: false)
            // so changed state shall be false until true
            changed: (state.entities[flight.id] && state.entities[flight.id].changed) || changed,
            valid
          }
        },
        state
      );
    }
    case ActionTypes.CAMPAIGN_FLIGHT_SET_GOAL: {
      const { flightId: id, totalGoal, dailyMinimum, uncapped, valid } = action.payload;
      return adapter.updateOne(
        {
          id,
          changes: {
            localFlight: { ...state.entities[id].localFlight, totalGoal, dailyMinimum: dailyMinimum || 0, uncapped: uncapped || false },
            changed: true,
            valid
          }
        },
        state
      );
    }
    case ActionTypes.CAMPAIGN_SAVE: {
      return adapter.removeMany(
        action.payload.tempDeletedFlights.map(flight => flight.id),
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
            const flight = docToFlight(updatedFlightDocs[id]);
            return { id, changes: { localFlight: flight, remoteFlight: flight, changed: false } };
          }),
          newState
        );
      }
      if (createdFlightDocs) {
        const newFlightIds = Object.keys(createdFlightDocs);
        newState = adapter.removeMany(newFlightIds, newState);
        newState = adapter.addMany(
          newFlightIds.map(newId => {
            const flight = docToFlight(createdFlightDocs[newId]);
            return { localFlight: flight, remoteFlight: flight, changed: false, valid: true };
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
