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
      const { params, flightId, flightDoc, campaignDoc } = payload;
      const startAt = params.startAt.toISOString().slice(0, 10);
      const endAt = params.endAt.toISOString().slice(0, 10);
      return this.flightPreviewService.createFlightPreview({ ...params, startAt, endAt }, flightDoc, campaignDoc).pipe(
        map(
          (flightDaysDocs: HalDoc[]) =>
            new flightPreviewActions.FlightPreviewCreateSuccess({ params, flightDaysDocs, flightId, flightDoc, campaignDoc })
        ),
        catchError(error => of(new flightPreviewActions.FlightPreviewCreateFailure({ error })))
      );
    })
  );

  constructor(private actions$: Actions, private flightPreviewService: FlightPreviewService) {}
}
