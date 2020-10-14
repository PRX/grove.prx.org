import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule, Action } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { of, Observable } from 'rxjs';
import { HalHttpError, MockHalDoc, ToastrService } from 'ngx-prx-styleguide';
import { CreativeService } from '../../../core';
import { TestComponent, campaignRoutes } from '../../../../testing/test.component';
import { reducers } from '../';
import { initialParams as params } from '../reducers/creative.reducer';
import * as creativeActions from '../actions/creative-action.creator';
import * as campaignActions from '../actions/campaign-action.creator';
import { CreativeEffects } from './creative.effects';
import { creativesFixture, advertisersFixture } from '../models/campaign-state.factory';

describe('CreativeEffects', () => {
  let effects: CreativeEffects;
  let actions$ = new Observable<Action>();
  let creativeService: CreativeService;
  const toastrService: ToastrService = { success: jest.fn() } as any;
  const docs = creativesFixture.map(doc => {
    const mock = new MockHalDoc(doc);
    mock.total = jest.fn(() => creativesFixture.length);
    return mock;
  });
  const advertiserDoc = new MockHalDoc(advertisersFixture[0]);
  const error = new HalHttpError(500, 'error occurred');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        RouterTestingModule.withRoutes(campaignRoutes),
        StoreModule.forRoot(
          {},
          {
            runtimeChecks: {
              strictStateImmutability: true,
              strictActionImmutability: true
            }
          }
        ),
        StoreModule.forFeature('campaignState', reducers),
        EffectsModule.forRoot([CreativeEffects])
      ],
      providers: [
        CreativeEffects,
        {
          provide: ToastrService,
          useValue: toastrService
        },
        {
          provide: CreativeService,
          useValue: {
            loadCreative: jest.fn(id => of(new MockHalDoc(docs[0]))),
            loadCreativeList: jest.fn(() => of(docs.map(creativeDoc => ({ creativeDoc, advertiserDoc })))),
            updateCreative: jest.fn(doc => of(docs[0])),
            createCreative: jest.fn(creative => of(docs[0]))
          }
        },
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.inject(CreativeEffects);
    creativeService = TestBed.inject(CreativeService);
  }));

  it('should load creative by id', () => {
    const loadAction = creativeActions.CreativeLoad({ id: creativesFixture[0].id });
    const success = creativeActions.CreativeLoadSuccess({ creativeDoc: docs[0] });
    actions$ = hot('-a', { a: loadAction });
    const expected = cold('-r', { r: success });
    expect(effects.creativeLoad$).toBeObservable(expected);
  });

  it('should return creative load failure action on error', () => {
    const loadAction = creativeActions.CreativeLoad({ id: creativesFixture[0].id });
    const errorResponse = cold('#', {}, error);
    creativeService.loadCreative = jest.fn(() => errorResponse);
    const outcome = creativeActions.CreativeLoadFailure({ error });
    actions$ = hot('-a', { a: loadAction });
    const expected = cold('-b', { b: outcome });
    expect(effects.creativeLoad$).toBeObservable(expected);
  });

  it('should create a new creative and add it to the flight', () => {
    const createAction = creativeActions.CreativeCreate({ campaignId: 1, flightId: 1, zoneId: 'pre_1', creative: creativesFixture[0] });
    const createSuccess = creativeActions.CreativeCreateSuccess({ campaignId: 1, flightId: 1, zoneId: 'pre_1', creativeDoc: docs[0] });
    const addCreative = campaignActions.CampaignFlightZoneAddCreatives({
      flightId: 1,
      zoneId: 'pre_1',
      creativeIds: [creativesFixture[0].id]
    });
    actions$ = hot('-a', { a: createAction });
    const expected = cold('-(bc)', { b: createSuccess, c: addCreative });
    expect(effects.creativeCreate$).toBeObservable(expected);
  });

  it('should return creative create failure action on error', () => {
    const createAction = creativeActions.CreativeCreate({ creative: creativesFixture[0] });
    const errorResponse = cold('#', {}, error);
    creativeService.createCreative = jest.fn(() => errorResponse);
    const outcome = creativeActions.CreativeCreateFailure({ error });
    actions$ = hot('-a', { a: createAction });
    const expected = cold('-b', { b: outcome });
    expect(effects.creativeCreate$).toBeObservable(expected);
  });

  it('should update a creative', () => {
    const updateAction = creativeActions.CreativeUpdate({
      campaignId: 1,
      flightId: 1,
      zoneId: 'pre_1',
      creativeDoc: docs[0],
      creative: creativesFixture[0]
    });
    const success = creativeActions.CreativeUpdateSuccess({
      campaignId: 1,
      flightId: 1,
      zoneId: 'pre_1',
      creativeDoc: docs[0]
    });
    actions$ = hot('-a', { a: updateAction });
    const expected = cold('-r', { r: success });
    expect(effects.creativeUpdate$).toBeObservable(expected);
  });

  it('should return creative update failure action on error', () => {
    const updateAction = creativeActions.CreativeUpdate({ creativeDoc: docs[0], creative: creativesFixture[0] });
    const errorResponse = cold('#', {}, error);
    creativeService.updateCreative = jest.fn(() => errorResponse);
    const outcome = creativeActions.CreativeUpdateFailure({ error });
    actions$ = hot('-a', { a: updateAction });
    const expected = cold('-b', { b: outcome });
    expect(effects.creativeUpdate$).toBeObservable(expected);
  });

  it('should load creative list', () => {
    const loadListAction = creativeActions.CreativeLoadList({ params });
    const success = creativeActions.CreativeLoadListSuccess({
      params,
      total: docs.length,
      docs: docs.map(doc => ({ creativeDoc: doc, advertiserDoc }))
    });

    actions$ = hot('-a', { a: loadListAction });
    const expected = cold('-r', { r: success });
    expect(effects.creativeLoadList$).toBeObservable(expected);
  });

  it('should return load creative list failure action on error', () => {
    const loadListAction = creativeActions.CreativeLoadList({ params });
    const errorResponse = cold('#', {}, error);
    creativeService.loadCreativeList = jest.fn(() => errorResponse);
    const outcome = creativeActions.CreativeLoadListFailure({ error });
    actions$ = hot('-a', { a: loadListAction });
    const expected = cold('-b', { b: outcome });
    expect(effects.creativeLoadList$).toBeObservable(expected);
  });
});
