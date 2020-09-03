import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { of, forkJoin } from 'rxjs';
import { map, mergeMap, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { ToastrService, HalDoc } from 'ngx-prx-styleguide';
import * as campaignActions from '../actions/campaign-action.creator';
import * as creativeActions from '../actions/creative-action.creator';
import { selectCreativeParams } from '../selectors';
import { CreativeService } from '../../../core';
import { docToCreative, CreativeParams } from '../models';

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
        this.creativeService.createCreative({ ...action.creative, pingbacks: this.filterPingbacks(action.creative.pingbacks) }).pipe(
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
        this.creativeService
          .updateCreative(action.creativeDoc, { ...action.creative, pingbacks: this.filterPingbacks(action.creative.pingbacks) })
          .pipe(
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
      withLatestFrom(this.store.pipe(select(selectCreativeParams))),
      mergeMap(([action, prevParams]) => {
        const params = { ...prevParams, ...action.params };
        return this.creativeService.loadCreativeList(params).pipe(map(creativeDocs => ({ params, creativeDocs })));
      }),
      mergeMap(({ params, creativeDocs }) =>
        forkJoin(
          creativeDocs.map(creativeDoc => creativeDoc.follow('prx:advertiser').pipe(map(advertiserDoc => ({ creativeDoc, advertiserDoc }))))
        ).pipe(map(docs => ({ params, docs })))
      ),
      map(({ params, docs }: { params: CreativeParams; docs: { creativeDoc: HalDoc; advertiserDoc: HalDoc }[] }) =>
        creativeActions.CreativeLoadListSuccess({
          params,
          total: docs.length && docs[0].creativeDoc.total(),
          docs
        })
      ),
      catchError(error => of(creativeActions.CreativeLoadListFailure({ error })))
    )
  );

  filterPingbacks(pingbacks: string[]) {
    return pingbacks.filter(p => p);
  }

  constructor(
    private actions$: Actions<creativeActions.CreativeActions>,
    private store: Store<any>,
    private creativeService: CreativeService,
    private router: Router,
    private toastr: ToastrService
  ) {}
}
