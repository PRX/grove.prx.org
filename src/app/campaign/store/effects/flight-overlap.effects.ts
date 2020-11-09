import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, filter, withLatestFrom } from 'rxjs/operators';
import { selectRoutedLocalFlight, selectFlightOverlapFilters } from '../selectors';
import { overlapFilters, Flight } from '../models';
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
      withLatestFrom(this.store.pipe(select(selectFlightOverlapFilters))),
      filter(this.shouldLoadOverlap),
      map(([flight, _]) => flightOverlapActions.FlightOverlapLoad({ flight }))
    )
  );

  loadOverlapOnFormChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(campaignActions.CampaignFlightFormUpdate),
      switchMap(_ => this.store.pipe(select(selectRoutedLocalFlight))),
      withLatestFrom(this.store.pipe(select(selectFlightOverlapFilters))),
      filter(this.shouldLoadOverlap),
      map(([flight, _]) => flightOverlapActions.FlightOverlapLoad({ flight }))
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

  // only reload overlapping flights when the filter params have changed
  private shouldLoadOverlap([flight, currentFilters]: [Flight, string]) {
    const newFilters = flight && overlapFilters(flight);
    return newFilters && newFilters !== currentFilters;
  }
}
