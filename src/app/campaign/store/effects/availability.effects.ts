import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { ActionTypes } from '../actions/action.types';
import { InventoryService } from '../../../core';
import * as availabilityActions from '../actions/availability-action.creator';

@Injectable()
export class AvailabilityEffects {
  @Effect()
  loadAvailability$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_AVAILABILITY_LOAD),
    map((action: availabilityActions.AvailabilityLoad) => action.payload),
    mergeMap(payload => {
      const { inventoryId, startDate, endDate, zone, flightId, createdAt } = payload;
      const startDateString = startDate.toISOString().slice(0, 10);
      const endDateString = endDate.toISOString().slice(0, 10);
      return this.inventoryService
        .getInventoryAvailability({
          id: inventoryId,
          startDate: startDateString,
          endDate: endDateString,
          zone,
          ...(createdAt && { flightId })
        })
        .pipe(
          map(
            (doc: HalDoc) =>
              new availabilityActions.AvailabilityLoadSuccess({ doc, params: { inventoryId, startDate, endDate, zone, flightId } })
          )
        );
    }),
    catchError(error => of(new availabilityActions.AvailabilityLoadFailure({ error })))
  );

  constructor(private actions$: Actions, private inventoryService: InventoryService) {}
}
