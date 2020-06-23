import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FlightPreviewService } from '../../../core';
import * as flightPreviewActions from '../actions/flight-preview-action.creator';

@Injectable()
export class FlightPreviewEffects {
  createFlightPreview$ = createEffect(() =>
    this.actions$.pipe(
      ofType(flightPreviewActions.FlightPreviewCreate),
      switchMap(action => {
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
    )
  );

  constructor(private actions$: Actions<flightPreviewActions.FlightPreviewActions>, private flightPreviewService: FlightPreviewService) {}
}
