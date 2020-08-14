import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as creativeActions from '../actions/creative-action.creator';
import { CreativeState, docToCreative, getCreativeId } from '../models';

export type State = EntityState<CreativeState>;

export const adapter: EntityAdapter<CreativeState> = createEntityAdapter<CreativeState>({ selectId: getCreativeId });

export const initialState: State = adapter.getInitialState({});

// tslint:disable-next-line: variable-name
const _reducer = createReducer(
  initialState,
  // on(creativeActions.CampaignCreativeNew, (state, action) => adapter.upsertOne({})),
  on(creativeActions.CreativeLoad, (state, action) => ({ ...state, error: null })),
  on(creativeActions.CreativeLoadSuccess, creativeActions.CreativeSaveSuccess, (state, action) =>
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
  on(creativeActions.CreativeLoadFailure, creativeActions.CreativeSaveFailure, (state, action) => ({ ...state, error: action.error })),
  on(creativeActions.CreativeFormUpdate, (state, action) => {
    const { creative, changed, valid } = action;
    return adapter.upsertOne({ creative, changed, valid }, state);
  })
);

export function reducer(state, action) {
  return _reducer(state, action);
}

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
