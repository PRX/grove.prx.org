import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ActionTypes } from '../actions/action.types';
import { AdvertiserActions } from '../actions/advertiser-action.creator';
import { docToAdvertiser, Advertiser } from '../models';

export interface State extends EntityState<Advertiser> {
  error?: any;
}

export const adapter: EntityAdapter<Advertiser> = createEntityAdapter<Advertiser>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export function reducer(state = initialState, action: AdvertiserActions): State {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_ADVERTISERS_LOAD_SUCCESS: {
      return { ...adapter.addAll(action.payload.docs.map(docToAdvertiser), state), error: null };
    }
    case ActionTypes.CAMPAIGN_ADD_ADVERTISER_SUCCESS: {
      return { ...adapter.addOne(docToAdvertiser(action.payload.doc), state) };
    }
    case ActionTypes.CAMPAIGN_ADD_ADVERTISER_FAILURE:
    case ActionTypes.CAMPAIGN_ADVERTISERS_LOAD_FAILURE: {
      return { ...state, error: action.payload.error };
    }
    default: {
      return state;
    }
  }
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
