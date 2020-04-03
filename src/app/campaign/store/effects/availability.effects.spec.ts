import { Actions } from '@ngrx/effects';
import { TestBed, async } from '@angular/core/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { of } from 'rxjs';
import { HalHttpError, MockHalDoc } from 'ngx-prx-styleguide';
import { InventoryService } from '../../../core';
import { getActions, TestActions } from '../../../store/test.actions';
import * as availabilityActions from '../actions/availability-action.creator';
import { AvailabilityEffects } from './availability.effects';
import { flightFixture, availabilityParamsFixture, availabilityDaysFixture } from '../models/campaign-state.factory';

const availabilityFixture = {
  startDate: '2019-10-01',
  endDate: '2019-11-01',
  days: availabilityDaysFixture
};

describe('AvailabilityEffects', () => {
  let effects: AvailabilityEffects;
  let actions$: TestActions;
  let inventoryService: InventoryService;

  // load action received by the effect
  const loadAction = new availabilityActions.AvailabilityLoad({
    inventoryId: flightFixture.set_inventory_uri.split('/').pop(),
    startDate: flightFixture.startAt,
    endDate: flightFixture.endAt,
    zone: flightFixture.zones[0],
    flightId: flightFixture.id,
    createdAt: new Date()
  });
  const doc = new MockHalDoc(availabilityFixture);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), EffectsModule.forRoot([AvailabilityEffects])],
      providers: [
        AvailabilityEffects,
        {
          provide: InventoryService,
          useValue: {
            getInventoryAvailability: jest.fn(() => of(doc))
          }
        },
        { provide: Actions, useFactory: getActions }
      ]
    });
    effects = TestBed.get(AvailabilityEffects);
    actions$ = TestBed.get(Actions);
    inventoryService = TestBed.get(InventoryService);
  }));

  it('should load availability', () => {
    const success = new availabilityActions.AvailabilityLoadSuccess({ doc, params: availabilityParamsFixture });

    actions$.stream = hot('-a', { a: loadAction });
    const expected = cold('-r', { r: success });
    expect(effects.loadAvailability$).toBeObservable(expected);
  });

  it('should return availability load failure action on error', () => {
    const halError = new HalHttpError(500, 'error occurred');
    // '#' throws this error in the stream instead of emitting a response
    const errorResponse = cold('#', {}, halError);
    inventoryService.getInventoryAvailability = jest.fn(() => errorResponse);

    // expected failure action to be emitted by effect upon catchError
    const outcome = new availabilityActions.AvailabilityLoadFailure({ error: halError });

    // emit the load action
    actions$.stream = hot('-a', { a: loadAction });
    // expect to see the error action
    const expected = cold('-(b|)', { b: outcome });
    // subscribe to the stream to process the load action, call the AllocationPreviewService, and get the result
    expect(effects.loadAvailability$).toBeObservable(expected);
  });
});
