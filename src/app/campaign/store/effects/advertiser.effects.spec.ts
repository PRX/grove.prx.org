import { Actions } from '@ngrx/effects';
import { TestBed, async } from '@angular/core/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { of } from 'rxjs';
import { HalHttpError, MockHalDoc } from 'ngx-prx-styleguide';
import { AdvertiserService } from '../../../core';
import { getActions, TestActions } from '../../../store/test.actions';
import * as advertiserActions from '../actions/advertiser-action.creator';
import { AdvertiserEffects } from './advertiser.effects';
import { advertisersFixture } from '../models/campaign-state.factory';

describe('AdvertiserEffects', () => {
  let effects: AdvertiserEffects;
  let actions$: TestActions;
  let advertiserService: AdvertiserService;

  // load action received by the effect
  const loadAction = new advertiserActions.AdvertisersLoad({});
  const docs = advertisersFixture.map(a => new MockHalDoc(a));
  const newAdvertiserDoc = new MockHalDoc({ id: `${docs[docs.length - 1].id + 1}`, name, set_advertiser_uri: '/some/uri' });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), EffectsModule.forRoot([AdvertiserEffects])],
      providers: [
        AdvertiserEffects,
        {
          provide: AdvertiserService,
          useValue: {
            loadAdvertisers: jest.fn(() => of(docs)),
            addAdvertiser: jest.fn(name => of(newAdvertiserDoc))
          }
        },
        { provide: Actions, useFactory: getActions }
      ]
    });
    effects = TestBed.get(AdvertiserEffects);
    actions$ = TestBed.get(Actions);
    advertiserService = TestBed.get(AdvertiserService);
  }));

  it('should load advertisers', () => {
    const success = new advertiserActions.AdvertisersLoadSuccess({ docs });

    actions$.stream = hot('-a', { a: loadAction });
    const expected = cold('-r', { r: success });
    expect(effects.loadAdvertisers$).toBeObservable(expected);
  });

  it('should return advertisers load failure action on error', () => {
    const halError = new HalHttpError(500, 'error occurred');
    // '#' throws this error in the stream instead of emitting a response
    const errorResponse = cold('#', {}, halError);
    advertiserService.loadAdvertisers = jest.fn(() => errorResponse);

    // expected failure action to be emitted by effect upon catchError
    const outcome = new advertiserActions.AdvertisersLoadFailure({ error: halError });

    // emit the load action
    actions$.stream = hot('-a', { a: loadAction });
    // expect to see the error action
    const expected = cold('-(b|)', { b: outcome });
    // subscribe to the stream to process the load action, call the AllocationPreviewService, and get the result
    expect(effects.loadAdvertisers$).toBeObservable(expected);
  });

  it('should add an advertiser', () => {
    const success = new advertiserActions.AddAdvertiserSuccess({ doc: newAdvertiserDoc });
    const addAction = new advertiserActions.AddAdvertiser({ name: 'Nooks Cranny' });

    actions$.stream = hot('-a', { a: addAction });
    const expected = cold('-r', { r: success });
    expect(effects.addAdvertiser$).toBeObservable(expected);
  });
});
