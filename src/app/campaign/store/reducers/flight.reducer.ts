import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as campaignActions from '../actions/campaign-action.creator';
import * as flightPreviewActions from '../actions/flight-preview-action.creator';
import { docToFlight, duplicateFlightState, FlightState, getFlightId } from '../models';

export interface State extends EntityState<FlightState> {
  // additional entities state properties for the collection
  campaignId?: number;
}

export const adapter: EntityAdapter<FlightState> = createEntityAdapter<FlightState>({ selectId: getFlightId });

export const initialState: State = adapter.getInitialState({});

export const reducer = createReducer(
  initialState,
  on(campaignActions.CampaignNew, (state, action) => ({ ...adapter.removeAll(state), campaignId: undefined })),
  on(campaignActions.CampaignDupFromForm, (state, action) =>
    adapter.addAll(
      action.flights.map((flight, i) => duplicateFlightState(flight, action.timestamp + i, true, false)),
      state
    )
  ),
  on(campaignActions.CampaignDupByIdSuccess, (state, action) =>
    adapter.addAll(
      action.flightDocs.map(doc => docToFlight(doc)).map((flight, i) => duplicateFlightState(flight, action.timestamp + i, true, false)),
      state
    )
  ),
  on(campaignActions.CampaignLoad, (state, action) => ({
    ...adapter.removeAll(state),
    campaignId: action.id
  })),
  on(campaignActions.CampaignLoadSuccess, (state, action) => {
    const flights = action.flightDocs.map(doc => {
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
  }),
  on(campaignActions.CampaignAddFlight, (state, action) => {
    const { flightId: id, startAt, endAt } = action;
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
  }),
  on(campaignActions.CampaignDupFlight, (state, action) => {
    const { flight, flightId } = action;
    return adapter.addOne(duplicateFlightState({ ...flight, name: `${flight.name} (Copy)` }, flightId, true, true), state);
  }),
  on(campaignActions.CampaignDeleteFlight, (state, action) => {
    const { id, softDeleted } = action;
    return adapter.updateOne({ id, changes: { softDeleted } }, state);
  }),
  on(campaignActions.CampaignFlightFormUpdate, (state, action) => {
    const { flight, changed, valid } = action;
    const localFlight = {
      ...(state.entities[flight.id] && state.entities[flight.id].localFlight),
      ...flight,
      dailyMinimum: flight.dailyMinimum || 0,
      uncapped: flight.uncapped || false
    };
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
  }),
  on(campaignActions.CampaignSave, (state, action) =>
    adapter.removeMany(
      action.tempDeletedFlights.map(flight => flight.id),
      state
    )
  ),
  on(campaignActions.CampaignSaveSuccess, (state, action) => {
    let newState = state;
    const { deletedFlightDocs, updatedFlightDocs, createdFlightDocs } = action;
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
  }),
  on(flightPreviewActions.FlightPreviewCreateSuccess, (state, action) => {
    const { flight, status, statusMessage } = action;
    const localFlight = state.entities[flight.id].localFlight;
    return adapter.updateOne({ id: flight.id, changes: { localFlight: { ...localFlight, status, statusMessage } } }, state);
  })
);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
