import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, withLatestFrom, switchMap, map } from 'rxjs/operators';
import { UserService } from '../../../core';
import * as accountActions from '../actions/account-action.creator';
import { ActionTypes } from '../actions/action.types';

@Injectable()
export class AccountEffects {
  @Effect()
  loadAllocationPreview$ = this.actions$.pipe(
    ofType(ActionTypes.CAMPAIGN_ACCOUNTS_LOAD),
    switchMap(() => this.user.accounts),
    withLatestFrom(this.user.defaultAccount),
    map(([accounts, defaultAccount]) => [defaultAccount].concat(accounts)),
    catchError(error => of(new accountActions.AccountsLoadFailure({ error })))
  );

  constructor(private actions$: Actions, private user: UserService) {}
}
