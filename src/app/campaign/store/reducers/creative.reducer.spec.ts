import { MockHalDoc } from 'ngx-prx-styleguide';
import * as creativeActions from '../actions/creative-action.creator';
import { creativesFixture, createCreativesState } from '../models/campaign-state.factory';
import { reducer, initialState, selectAll, State } from './creative.reducer';

describe('Creative Reducer', () => {
  it('should upsert a new creative', () => {
    const result = reducer(initialState, creativeActions.CreativeNew());
    const newState = selectAll(result).find(creative => !creative.creative.createdAt);
    expect(newState.creative.id).toEqual('new');
    expect(newState.valid).toBeFalsy();
  });

  it('should set error on failure and clear error on api request', () => {
    const error = 'some error occurred';
    let state = createCreativesState().creatives as State;

    // load one
    state = reducer(state, creativeActions.CreativeLoadFailure({ error }));
    expect(state.error).toEqual(error);
    state = reducer(state, creativeActions.CreativeLoad({ id: 1 }));
    expect(state.error).toBeNull();

    // create
    state = reducer(state, creativeActions.CreativeCreateFailure({ error }));
    expect(state.error).toEqual(error);
    state = reducer(state, creativeActions.CreativeCreate({ creative: creativesFixture[0] }));
    expect(state.error).toBeNull();

    // update
    state = reducer(state, creativeActions.CreativeUpdateFailure({ error }));
    expect(state.error).toEqual(error);
    state = reducer(state, creativeActions.CreativeUpdate({ creative: creativesFixture[0] }));
    expect(state.error).toBeNull();

    // load list
    state = reducer(state, creativeActions.CreativeLoadListFailure({ error }));
    expect(state.error).toEqual(error);
    state = reducer(state, creativeActions.CreativeLoadList({ params: { page: 1 } }));
    expect(state.error).toBeNull();
  });

  it('should set creative on creative load, create, or update', () => {
    let state = reducer(initialState, creativeActions.CreativeCreateSuccess({ creativeDoc: new MockHalDoc(creativesFixture[0]) }));
    expect(state.entities[creativesFixture[0].id].creative.url).toEqual(creativesFixture[0].url);
    state = reducer(
      state,
      creativeActions.CreativeUpdateSuccess({ creativeDoc: new MockHalDoc({ ...creativesFixture[0], url: 'new/url' }) })
    );
    expect(state.entities[creativesFixture[0].id].creative.url).toEqual('new/url');
    state = reducer(state, creativeActions.CreativeLoadSuccess({ creativeDoc: new MockHalDoc(creativesFixture[1]) }));
    expect(state.entities[creativesFixture[1].id].creative.url).toEqual(creativesFixture[1].url);
  });

  it('should set creative list with current params and total', () => {
    const state = reducer(
      initialState,
      creativeActions.CreativeLoadListSuccess({
        params: { page: 1 },
        total: 2,
        docs: creativesFixture.map(doc => ({ creativeDoc: new MockHalDoc(doc), advertiserDoc: new MockHalDoc() }))
      })
    );
    expect(state.params.page).toEqual(1);
    expect(state.total).toEqual(2);
    expect(state.ids.length).toEqual(2);
    expect(state.entities[creativesFixture[0].id].creative.url).toEqual(creativesFixture[0].url);
    expect(state.entities[creativesFixture[1].id].creative.url).toEqual(creativesFixture[1].url);
  });
});
