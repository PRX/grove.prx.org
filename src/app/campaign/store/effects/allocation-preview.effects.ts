import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AllocationPreviewService } from '../../../core';
import * as allocationPreviewActions from '../actions/allocation-preview-action.creator';
import { ActionTypes } from '../actions/action.types';

@Injectable()
export class AllocationPreviewEffects {
  @Effect()
  loadAllocationPreview$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD),
    map((action: allocationPreviewActions.AllocationPreviewLoad) => action.payload),
    switchMap(payload => {
      const {
        flightId,
        createdAt,
        set_inventory_uri,
        name,
        startAt: startAtDate,
        endAt: endAtDate,
        totalGoal,
        dailyMinimum,
        zones
      } = payload;
      const startAt = startAtDate.toISOString().slice(0, 10);
      const endAt = endAtDate.toISOString().slice(0, 10);
      return this.allocationPreviewService.getAllocationPreview({
        ...(createdAt && { id: flightId }),
        set_inventory_uri,
        name,
        startAt,
        endAt,
        totalGoal,
        dailyMinimum: dailyMinimum || 0,
        zones
      });
    }),
    map((allocationPreviewDoc: HalDoc) => new allocationPreviewActions.AllocationPreviewLoadSuccess({ allocationPreviewDoc })),
    catchError(error => of(new allocationPreviewActions.AllocationPreviewLoadFailure({ error })))
  );

  constructor(private actions$: Actions, private allocationPreviewService: AllocationPreviewService) {}
}
