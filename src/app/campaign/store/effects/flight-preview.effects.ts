import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { FlightPreviewService } from '../../../core';
import * as flightPreviewActions from '../actions/flight-preview-action.creator';

@Injectable()
export class FlightPreviewEffects {
  @Effect()
  createFlightPreview$ = this.actions$.pipe(
    ofType(flightPreviewActions.FlightPreviewCreate),
    mergeMap(action => {
      const { flight, flightDoc, campaignDoc } = action;
      return this.flightPreviewService.createFlightPreview(flight, flightDoc, campaignDoc).pipe(
        map(({ status, statusMessage, days: flightDaysDocs }) => {
          return flightPreviewActions.FlightPreviewCreateSuccess({
            flight,
            status,
            statusMessage,
            flightDaysDocs,
            flightDoc,
            campaignDoc
          });
        }),
        catchError(error => of(flightPreviewActions.FlightPreviewCreateFailure({ flight, error })))
      );
    })
  );

  constructor(private actions$: Actions<flightPreviewActions.FlightPreviewActions>, private flightPreviewService: FlightPreviewService) {}
}
