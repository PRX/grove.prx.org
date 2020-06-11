import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as advertiserActions from '../actions/advertiser-action.creator';
import { docToAdvertiser, Advertiser } from '../models';

export interface State extends EntityState<Advertiser> {
  error?: any;
}

export const adapter: EntityAdapter<Advertiser> = createEntityAdapter<Advertiser>();

export const initialState: State = adapter.getInitialState({});

// tslint:disable-next-line: variable-name
const _reducer = createReducer(
  initialState,
  on(advertiserActions.AdvertisersLoadSuccess, (state, action) => ({
    ...adapter.addAll(action.docs.map(docToAdvertiser), state),
    error: null
  })),
  on(advertiserActions.AddAdvertiserSuccess, (state, action) => adapter.addOne(docToAdvertiser(action.doc), state)),
  on(advertiserActions.AddAdvertiserFailure, advertiserActions.AdvertisersLoadFailure, (state, action) => ({
    ...state,
    error: action.error
  }))
);

export function reducer(state, action) {
  return _reducer(state, action);
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
