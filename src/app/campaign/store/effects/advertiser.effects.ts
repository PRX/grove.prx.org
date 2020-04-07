import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap, map, tap } from 'rxjs/operators';
import { AdvertiserService } from '../../../core';
import * as advertiserActions from '../actions/advertiser-action.creator';
import { ActionTypes } from '../actions/action.types';

@Injectable()
export class AdvertiserEffects {
  @Effect()
  loadAdvertisers$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_ADVERTISERS_LOAD),
    switchMap(() => this.advertiserService.loadAdvertisers()),
    map(docs => new advertiserActions.AdvertisersLoadSuccess({ docs })),
    catchError(error => of(new advertiserActions.AdvertisersLoadFailure({ error })))
  );

  @Effect()
  addAdvertiser$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_ADD_ADVERTISER),
    map((action: advertiserActions.AddAdvertiser) => action.payload),
    switchMap(payload => this.advertiserService.addAdvertiser(payload.name)),
    map(doc => new advertiserActions.AddAdvertiserSuccess({ doc })),
    catchError(error => of(new advertiserActions.AddAdvertiserFailure({ error })))
  );

  constructor(private actions$: Actions, private advertiserService: AdvertiserService) {}
}
