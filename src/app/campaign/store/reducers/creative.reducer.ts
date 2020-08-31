import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as creativeActions from '../actions/creative-action.creator';
import { CreativeState, CreativeParams, docToCreative, getCreativeId } from '../models';

export interface State extends EntityState<CreativeState> {
  params?: CreativeParams;
  total?: number;
}

export const adapter: EntityAdapter<CreativeState> = createEntityAdapter<CreativeState>({ selectId: getCreativeId });

export const initialState: State = adapter.getInitialState({
  params: {
    page: 1,
    per: 5,
    sorts: 'filename',
    direction: 'asc'
  }
});

// tslint:disable-next-line: variable-name
const _reducer = createReducer(
  initialState,
  on(creativeActions.CreativeNew, (state, action) =>
    adapter.upsertOne(
      {
        creative: {
          id: getCreativeId(),
          url: '',
          filename: '',
          set_account_uri: '',
          set_advertiser_uri: '',
          pingbacks: []
        },
        changed: false,
        valid: false,
        error: null
      },
      state
    )
  ),
  on(creativeActions.CreativeLoad, creativeActions.CreativeLoadList, (state, action) => ({ ...state, error: null })),
  on(creativeActions.CreativeLoadSuccess, creativeActions.CreativeCreateSuccess, creativeActions.CreativeUpdateSuccess, (state, action) =>
    adapter.upsertOne(
      {
        doc: action.creativeDoc,
        creative: docToCreative(action.creativeDoc),
        changed: false,
        valid: true
      },
      state
    )
  ),
  on(creativeActions.CreativeLoadListSuccess, (state, action) =>
    adapter.addAll(
      action.docs.map(doc => ({
        doc: doc.creativeDoc,
        creative: docToCreative(doc.creativeDoc, doc.advertiserDoc),
        changed: false,
        valid: true
      })),
      { ...state, params: action.params, total: action.total }
    )
  ),
  on(
    creativeActions.CreativeLoadFailure,
    creativeActions.CreativeCreateFailure,
    creativeActions.CreativeUpdateFailure,
    creativeActions.CreativeLoadListFailure,
    (state, action) => ({ ...state, error: action.error })
  ),
  on(creativeActions.CreativeFormUpdate, (state, action) => {
    const { creative, changed, valid } = action;
    return adapter.upsertOne({ creative, changed, valid }, state);
  })
);

export function reducer(state, action) {
  return _reducer(state, action);
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
