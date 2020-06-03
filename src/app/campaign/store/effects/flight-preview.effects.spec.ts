import { Actions } from '@ngrx/effects';
import { TestBed, async } from '@angular/core/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { of } from 'rxjs';
import { HalHttpError, MockHalDoc } from 'ngx-prx-styleguide';
import { FlightPreviewService } from '../../../core';
import { getActions, TestActions } from '../../../store/test.actions';
import * as flightPreviewActions from '../actions/flight-preview-action.creator';
import { FlightPreviewEffects } from './flight-preview.effects';
import { campaignDocFixture, flightFixture, flightDocFixture, flightDaysDocFixture } from '../models/campaign-state.factory';

describe('FlightPreviewEffects', () => {
  let effects: FlightPreviewEffects;
  let actions$: TestActions;
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
      imports: [StoreModule.forRoot({}), EffectsModule.forRoot([FlightPreviewEffects])],
      providers: [
        FlightPreviewEffects,
        {
          provide: FlightPreviewService,
          useValue: {
            createFlightPreview: jest.fn(() => of({ status: 'ok', statusMessage: null, days: flightDaysDocFixture }))
          }
        },
        { provide: Actions, useFactory: getActions }
      ]
    });
    effects = TestBed.get(FlightPreviewEffects);
    actions$ = TestBed.get(Actions);
    flightPreviewService = TestBed.get(FlightPreviewService);
  }));

  it('should create flight preview', () => {
    const success = flightPreviewActions.FlightPreviewCreateSuccess({
      flight: flightFixture,
      status: 'ok',
      statusMessage: null,
      flightDaysDocs: flightDaysDocFixture,
      flightDoc,
      campaignDoc
    });

    actions$.stream = hot('-a', { a: createAction });
    const expected = cold('-r', { r: success });
    expect(effects.createFlightPreview$).toBeObservable(expected);
  });

  it('should return create flight preview failure action on error', () => {
    const halError = new HalHttpError(500, 'error occurred');
    const errorResponse = cold('#', {}, halError);
    flightPreviewService.createFlightPreview = jest.fn(() => errorResponse);
    const outcome = flightPreviewActions.FlightPreviewCreateFailure({ flight: flightFixture, error: halError });

    actions$.stream = hot('-a', { a: createAction });
    const expected = cold('-b', { b: outcome });
    expect(effects.createFlightPreview$).toBeObservable(expected);
  });
});
