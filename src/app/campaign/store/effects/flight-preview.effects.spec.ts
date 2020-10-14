import { TestBed, async } from '@angular/core/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule, Action } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { of, Observable } from 'rxjs';
import { HalHttpError, MockHalDoc } from 'ngx-prx-styleguide';
import { FlightPreviewService } from '../../../core';
import * as flightPreviewActions from '../actions/flight-preview-action.creator';
import { FlightPreviewEffects } from './flight-preview.effects';
import { campaignDocFixture, flightFixture, flightDocFixture, flightDaysDocFixture } from '../models/campaign-state.factory';

describe('FlightPreviewEffects', () => {
  let effects: FlightPreviewEffects;
  let actions$ = new Observable<Action>();
  let flightPreviewService: FlightPreviewService;

  const flightDoc = new MockHalDoc(flightDocFixture);
  const campaignDoc = new MockHalDoc(campaignDocFixture);

  // create action received by the effect
  const createAction = flightPreviewActions.FlightPreviewCreate({
    flight: flightFixture,
    flightDoc,
    campaignDoc
  });

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
        EffectsModule.forRoot([FlightPreviewEffects])
      ],
      providers: [
        FlightPreviewEffects,
        {
          provide: FlightPreviewService,
          useValue: {
            createFlightPreview: jest.fn(() => of({ allocationStatus: 'ok', allocationStatusMessage: null, days: flightDaysDocFixture }))
          }
        },
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.inject(FlightPreviewEffects);
    flightPreviewService = TestBed.inject(FlightPreviewService);
  }));

  it('should create flight preview', () => {
    const success = flightPreviewActions.FlightPreviewCreateSuccess({
      flight: flightFixture,
      allocationStatus: 'ok',
      allocationStatusMessage: null,
      flightDaysDocs: flightDaysDocFixture,
      flightDoc,
      campaignDoc
    });

    actions$ = hot('-a', { a: createAction });
    const expected = cold('-r', { r: success });
    expect(effects.createFlightPreview$).toBeObservable(expected);
  });

  it('should return create flight preview failure action on error', () => {
    const halError = new HalHttpError(500, 'error occurred');
    const errorResponse = cold('#', {}, halError);
    flightPreviewService.createFlightPreview = jest.fn(() => errorResponse);
    const outcome = flightPreviewActions.FlightPreviewCreateFailure({ flight: flightFixture, error: halError });

    actions$ = hot('-a', { a: createAction });
    const expected = cold('-b', { b: outcome });
    expect(effects.createFlightPreview$).toBeObservable(expected);
  });
});
