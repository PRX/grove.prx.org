import { TestBed, async } from '@angular/core/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule, Action } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { of, Observable } from 'rxjs';
import { HalHttpError, MockHalDoc } from 'ngx-prx-styleguide';
import { AdvertiserService } from '../../../core';
import * as advertiserActions from '../actions/advertiser-action.creator';
import { AdvertiserEffects } from './advertiser.effects';
import { advertisersFixture } from '../models/campaign-state.factory';

describe('AdvertiserEffects', () => {
  let effects: AdvertiserEffects;
  let actions$ = new Observable<Action>();
  let advertiserService: AdvertiserService;

  // load action received by the effect
  const loadAction = advertiserActions.AdvertisersLoad();
  const docs = advertisersFixture.map(a => new MockHalDoc(a));
  const newAdvertiserDoc = new MockHalDoc({ id: `${docs[docs.length - 1].id + 1}`, name, set_advertiser_uri: '/some/uri' });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(
          {},
          {
            runtimeChecks: {
              strictStateImmutability: true,
              strictActionImmutability: true
            }
          }
        ),
        EffectsModule.forRoot([AdvertiserEffects])
      ],
      providers: [
        AdvertiserEffects,
        {
          provide: AdvertiserService,
          useValue: {
            loadAdvertisers: jest.fn(() => of(docs)),
            addAdvertiser: jest.fn(name => of(newAdvertiserDoc))
          }
        },
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.inject(AdvertiserEffects);
    advertiserService = TestBed.inject(AdvertiserService);
  }));

  it('should load advertisers', () => {
    const success = advertiserActions.AdvertisersLoadSuccess({ docs });

    actions$ = hot('-a', { a: loadAction });
    const expected = cold('-r', { r: success });
    expect(effects.loadAdvertisers$).toBeObservable(expected);
  });

  it('should return advertisers load failure action on error', () => {
    const halError = new HalHttpError(500, 'error occurred');
    // '#' throws this error in the stream instead of emitting a response
    const errorResponse = cold('#', {}, halError);
    advertiserService.loadAdvertisers = jest.fn(() => errorResponse);

    // expected failure action to be emitted by effect upon catchError
    const outcome = advertiserActions.AdvertisersLoadFailure({ error: halError });

    // emit the load action
    actions$ = hot('-a', { a: loadAction });
    // expect to see the error action
    const expected = cold('-b', { b: outcome });
    // subscribe to the stream to process the load action, call the AllocationPreviewService, and get the result
    expect(effects.loadAdvertisers$).toBeObservable(expected);
  });

  it('should add an advertiser', () => {
    const success = advertiserActions.AddAdvertiserSuccess({ doc: newAdvertiserDoc });
    const addAction = advertiserActions.AddAdvertiser({ name: 'Nooks Cranny' });

    actions$ = hot('-a', { a: addAction });
    const expected = cold('-r', { r: success });
    expect(effects.addAdvertiser$).toBeObservable(expected);
  });
});
