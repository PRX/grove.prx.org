import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { selectRoutedLocalFlight } from '../selectors';
import { overlapFilters } from '../models';
import * as flightOverlapActions from '../actions/flight-overlap-action.creator';
import * as campaignActions from '../actions/campaign-action.creator';
import { FlightOverlapService } from 'src/app/core';
import { of } from 'rxjs';

@Injectable()
export class FlightOverlapEffects {
  loadOverlapOnFlightLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(campaignActions.CampaignLoadSuccess),
      switchMap(_ => this.store.pipe(select(selectRoutedLocalFlight))),
      map(flight => flightOverlapActions.FlightOverlapLoad({ flight }))
    )
  );

  loadFlightOverlap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(flightOverlapActions.FlightOverlapLoad),
      switchMap(({ flight }) =>
        this.overlap.loadFlightOverlap(overlapFilters(flight)).pipe(
          map(docs => flightOverlapActions.FlightOverlapLoadSuccess({ flight, overlap: docs })),
          catchError(error => of(flightOverlapActions.FlightOverlapLoadFailure({ flight, error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions<flightOverlapActions.FlightOverlapActions>,
    private store: Store<any>,
    private overlap: FlightOverlapService
  ) {}
}
