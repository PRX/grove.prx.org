import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes, CampaignActions } from '../actions';
import { docToFlight, Flight, FlightState } from './campaign.models';

export interface State extends EntityState<FlightState> {
  // additional entities state properties for the collection
  // campaignId?
}

export const adapter: EntityAdapter<FlightState> = createEntityAdapter<FlightState>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(state = initialState, action: CampaignActions): State {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_NEW: {
      return adapter.removeAll(state);
    }
    case ActionTypes.CAMPAIGN_LOAD_SUCCESS: {
      const flights = action.payload.flightDocs.map(flightDoc => {
        const flight = docToFlight(flightDoc);
        return {
          id: flightDoc.id,
          localFlight: flight,
          remoteFlight: flight,
          changed: false,
          valid: true
        };
      });
      return adapter.addAll(flights, state);
    }
    case ActionTypes.CAMPAIGN_ADD_FLIGHT: {
      const date = new Date();
      const id = date.getTime();
      const initialFlightState: FlightState = {
        id,
        localFlight: {
          name: 'New Flight ' + state.ids.length + 1,
          startAt: new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
          endAt: new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1)),
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
      const { flight } = action.payload;
      const date = new Date();
      const id = date.getTime();
      const localFlight: Flight = { ...flight, name: `${flight.name} (Copy)` };
      return adapter.addOne({ id, localFlight, changed: true, valid: true }, state);
    }
    case ActionTypes.CAMPAIGN_DELETE_FLIGHT: {
      const { id, softDeleted } = action.payload;
      return adapter.updateOne({ id, changes: { softDeleted } }, state);
    }
    case ActionTypes.CAMPAIGN_FLIGHT_FORM_UPDATE: {
      const { id, flight: localFlight, changed, valid } = action.payload;
      return adapter.upsertOne({ id, localFlight, changed, valid }, state);
    }
    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
