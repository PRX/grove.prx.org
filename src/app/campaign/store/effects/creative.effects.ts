import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-prx-styleguide';
import * as campaignActions from '../actions/campaign-action.creator';
import * as creativeActions from '../actions/creative-action.creator';
import { CreativeService } from '../../../core';
import { docToCreative } from '../models';

@Injectable()
export class CreativeEffects {
  creativeLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(creativeActions.CreativeLoad),
      mergeMap(action => this.creativeService.loadCreative(action.id)),
      map(creativeDoc => creativeActions.CreativeLoadSuccess({ creativeDoc })),
      catchError(error => of(creativeActions.CreativeLoadFailure({ error })))
    )
  );

  creativeCreate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(creativeActions.CreativeCreate),
      mergeMap(action =>
        this.creativeService.createCreative(action.creative).pipe(
          mergeMap(creativeDoc => {
            const { campaignId, flightId, zoneId, creative } = action;
            if (campaignId && flightId) {
              // route back to flight (if there is one in the original action)
              this.router.navigate(['/campaign', campaignId, 'flight', flightId]);
            }
            // save creative success and save creative to flight
            return [
              creativeActions.CreativeCreateSuccess({ campaignId, flightId, zoneId, creativeDoc }),
              campaignActions.CampaignFlightZoneAddCreative({ flightId, zoneId, creative: docToCreative(creativeDoc) })
            ];
          }),
          tap(_ => {
            this.toastr.success('Creative saved');
          }),
          catchError(error => of(creativeActions.CreativeCreateFailure({ error })))
        )
      )
    )
  );

  creativeUpdate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(creativeActions.CreativeUpdate),
      mergeMap(action =>
        this.creativeService.updateCreative(action.creativeDoc, action.creative).pipe(
          map(creativeDoc => {
            const { campaignId, flightId, zoneId } = action;
            if (campaignId && flightId) {
              // route back to flight (if there is one in the original action)
              this.router.navigate(['/campaign', campaignId, 'flight', flightId]);
            }
            return creativeActions.CreativeUpdateSuccess({ campaignId, flightId, zoneId, creativeDoc });
          }),
          tap(_ => {
            this.toastr.success('Creative saved');
          }),
          catchError(error => of(creativeActions.CreativeUpdateFailure({ error })))
        )
      )
    )
  );

  creativeLoadList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(creativeActions.CreativeLoadList),
      mergeMap(_ =>
        this.creativeService.loadCreativeList().pipe(
          map(creativeDocs => creativeActions.CreativeLoadListSuccess({ creativeDocs })),
          catchError(error => of(creativeActions.CreativeLoadListFailure({ error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions<creativeActions.CreativeActions>,
    private creativeService: CreativeService,
    private router: Router,
    private toastr: ToastrService
  ) {}
}
