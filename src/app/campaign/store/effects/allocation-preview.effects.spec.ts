import { Actions } from '@ngrx/effects';
import { TestBed, async } from '@angular/core/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { of } from 'rxjs';
import { HalHttpError, MockHalDoc } from 'ngx-prx-styleguide';
import { AllocationPreviewService } from '../../../core';
import { getActions, TestActions } from '../../../store/test.actions';
import * as allocationPreviewActions from '../actions/allocation-preview-action.creator';
import { AllocationPreviewEffects } from './allocation-preview.effects';
import { allocationPreviewParamsFixture, allocationPreviewFixture, flightFixture } from '../models/campaign-state.factory';

describe('AllocationPreviewEffects', () => {
  let effects: AllocationPreviewEffects;
  let actions$: TestActions;
  let allocationPreviewService: AllocationPreviewService;
  const allocationPreviewDoc = new MockHalDoc({ ...allocationPreviewParamsFixture, allocations: allocationPreviewFixture });

  // load action received by the effect
  const loadAction = new allocationPreviewActions.AllocationPreviewLoad({
    ...allocationPreviewParamsFixture,
    createdAt: new Date(),
    set_inventory_uri: flightFixture.set_inventory_uri
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), EffectsModule.forRoot([AllocationPreviewEffects])],
      providers: [
        AllocationPreviewEffects,
        {
          provide: AllocationPreviewService,
          useValue: {
            getAllocationPreview: jest.fn(() => of(allocationPreviewDoc))
          }
        },
        { provide: Actions, useFactory: getActions }
      ]
    });
    effects = TestBed.get(AllocationPreviewEffects);
    actions$ = TestBed.get(Actions);
    allocationPreviewService = TestBed.get(AllocationPreviewService);
  }));

  it('should load allocation preview', () => {
    const success = new allocationPreviewActions.AllocationPreviewLoadSuccess({ allocationPreviewDoc });

    actions$.stream = hot('-a', { a: loadAction });
    const expected = cold('-r', { r: success });
    expect(effects.loadAllocationPreview$).toBeObservable(expected);
  });

  it('should return allocation preview load failure action on error', () => {
    const halError = new HalHttpError(422, 'no allocatable days for flight');
    // '#' throws this error in the stream instead of emitting a response
    const errorResponse = cold('#', {}, halError);
    allocationPreviewService.getAllocationPreview = jest.fn(() => errorResponse);

    // expected failure action to be emitted by effect upon catchError
    const outcome = new allocationPreviewActions.AllocationPreviewLoadFailure({ error: halError });

    // emit the load action
    actions$.stream = hot('-a', { a: loadAction });
    // expect to see the error action
    const expected = cold('-(b|)', { b: outcome });
    // subscribe to the stream to process the load action, call the AllocationPreviewService, and get the result
    expect(effects.loadAllocationPreview$).toBeObservable(expected);
  });
});
