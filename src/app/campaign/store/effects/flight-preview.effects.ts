import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { ActionTypes } from '../actions/action.types';
import { FlightPreviewService } from '../../../core';
import * as flightPreviewActions from '../actions/flight-preview-action.creator';

@Injectable()
export class FlightPreviewEffects {
  @Effect()
  createFlightPreview$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_FLIGHT_PREVIEW_CREATE),
    map((action: flightPreviewActions.FlightPreviewCreate) => action.payload),
    mergeMap(payload => {
      const { flight, flightDoc, campaignDoc } = payload;
      return this.flightPreviewService.createFlightPreview(flight, flightDoc, campaignDoc).pipe(
        map(({ status, statusMessage, days: flightDaysDocs }) => {
          return new flightPreviewActions.FlightPreviewCreateSuccess({
            flight,
            status,
            statusMessage,
            flightDaysDocs,
            flightDoc,
            campaignDoc
          });
        }),
        catchError(error => of(new flightPreviewActions.FlightPreviewCreateFailure({ flight, error })))
      );
    })
  );

  constructor(private actions$: Actions, private flightPreviewService: FlightPreviewService) {}
}
