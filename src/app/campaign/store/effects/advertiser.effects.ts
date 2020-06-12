import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { AdvertiserService } from '../../../core';
import * as advertiserActions from '../actions/advertiser-action.creator';

@Injectable()
export class AdvertiserEffects {
  loadAdvertisers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(advertiserActions.AdvertisersLoad),
      switchMap(() => this.advertiserService.loadAdvertisers()),
      map(docs => advertiserActions.AdvertisersLoadSuccess({ docs })),
      catchError(error => of(advertiserActions.AdvertisersLoadFailure({ error })))
    )
  );

  addAdvertiser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(advertiserActions.AddAdvertiser),
      switchMap(action => this.advertiserService.addAdvertiser(action.name)),
      map(doc => advertiserActions.AddAdvertiserSuccess({ doc })),
      catchError(error => of(advertiserActions.AddAdvertiserFailure({ error })))
    )
  );

  constructor(private actions$: Actions<advertiserActions.AdvertiserActions>, private advertiserService: AdvertiserService) {}
}
