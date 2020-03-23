import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AllocationPreviewService } from '../../../core';
import * as actions from '../actions';
import { ActionTypes } from '../actions/action.types';

@Injectable()
export class AllocationPreviewEffects {
  @Effect()
  loadAllocationPreview$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD),
    map((action: actions.AllocationPreviewLoad) => action.payload),
    switchMap(payload => {
      const { flightId, set_inventory_uri, name, startAt: startAtDate, endAt: endAtDate, totalGoal, dailyMinimum, zones } = payload;
      const startAt = startAtDate.toISOString().slice(0, 10);
      const endAt = endAtDate.toISOString().slice(0, 10);
      return (
        this.allocationPreviewService
          .getAllocationPreview({
            ...(flightId && { id: flightId }),
            set_inventory_uri,
            name,
            startAt,
            endAt,
            totalGoal,
            dailyMinimum: dailyMinimum || 0,
            zones
          })
          // should be able to pipe these after the switchMap and not use inner pipe,
          //  but I can't get the failure test case to pass that way. annoying, meh
          .pipe(
            map((allocationPreviewDoc: HalDoc) => new actions.AllocationPreviewLoadSuccess({ allocationPreviewDoc })),
            catchError(error => of(new actions.AllocationPreviewLoadFailure({ error })))
          )
      );
    })
  );

  constructor(private actions$: Actions, private allocationPreviewService: AllocationPreviewService) {}
}
