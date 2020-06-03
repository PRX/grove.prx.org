import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, withLatestFrom, switchMap, map } from 'rxjs/operators';
import { UserService } from '../../../core';
import * as accountActions from '../actions/account-action.creator';

@Injectable()
export class AccountEffects {
  @Effect()
  loadAccounts$ = this.actions$.pipe(
    ofType(accountActions.AccountsLoad),
    switchMap(() => this.user.accounts),
    withLatestFrom(this.user.defaultAccount),
    map(([accounts, defaultAccount]) => accountActions.AccountsLoadSuccess({ docs: [defaultAccount].concat(accounts) })),
    catchError(error => of(accountActions.AccountsLoadFailure({ error })))
  );

  constructor(private actions$: Actions<accountActions.AccountActions>, private user: UserService) {}
}
