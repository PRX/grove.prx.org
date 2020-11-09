import { TestBed, async } from '@angular/core/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule, Action } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of, Observable } from 'rxjs';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { FlightOverlapService } from '../../../core';
import { flightDocFixture, flightFixture } from '../models/campaign-state.factory';
import { FlightOverlapEffects } from './flight-overlap.effects';
import * as campaignActions from '../actions/campaign-action.creator';
import * as flightOverlapActions from '../actions/flight-overlap-action.creator';
import { selectRoutedLocalFlight, selectFlightOverlapFilters } from '../selectors';
import { overlapFilters } from '../models';

describe('FlightOverlapEffects', () => {
  let effects: FlightOverlapEffects;
  let actions$ = new Observable<Action>();
  let store: MockStore;

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
        EffectsModule.forRoot([FlightOverlapEffects])
      ],
      providers: [
        FlightOverlapEffects,
        {
          provide: FlightOverlapService,
          useValue: {
            loadFlightOverlap: jest.fn(() => of([new MockHalDoc(flightDocFixture)]))
          }
        },
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            { selector: selectRoutedLocalFlight, value: flightFixture },
            { selector: selectFlightOverlapFilters, value: null }
          ]
        })
      ]
    });
    effects = TestBed.inject(FlightOverlapEffects);
    store = TestBed.inject(MockStore);
  }));

  it('loads flight overlap on flight load', () => {
    const success = flightOverlapActions.FlightOverlapLoad({ flight: flightFixture });
    actions$ = hot('-a', { a: campaignActions.CampaignLoadSuccess({ campaignDoc: null, flightDocs: [], flightDaysDocs: {} }) });
    const expected = cold('-r', { r: success });
    expect(effects.loadOverlapOnFlightLoad$).toBeObservable(expected);
  });

  it('does not load overlap if the filters have not changed', () => {
    store.overrideSelector(selectFlightOverlapFilters, overlapFilters(flightFixture));
    actions$ = hot('-a', { a: campaignActions.CampaignLoadSuccess({ campaignDoc: null, flightDocs: [], flightDaysDocs: {} }) });
    const expected = cold('');
    expect(effects.loadOverlapOnFlightLoad$).toBeObservable(expected);
  });
});
