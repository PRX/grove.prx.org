import { TestBed, async } from '@angular/core/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule, Action } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { of, Observable } from 'rxjs';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { UserService } from '../../../core';
import * as accountActions from '../actions/account-action.creator';
import { AccountEffects } from './account.effects';
import { accountsFixture } from '../models/campaign-state.factory';

describe('AccountEffects', () => {
  let effects: AccountEffects;
  let actions$ = new Observable<Action>();
  let userService: UserService;
  const defaultAccountDoc = new MockHalDoc(accountsFixture[0]);
  const accountDocs = accountsFixture.slice(1).map(a => new MockHalDoc(a));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(
          {},
          {
            runtimeChecks: {
              strictStateImmutability: true,
              strictActionImmutability: true
            }
          }
        ),
        EffectsModule.forRoot([AccountEffects])
      ],
      providers: [
        AccountEffects,
        {
          provide: UserService,
          useValue: {
            defaultAccount: of(defaultAccountDoc),
            accounts: of(accountDocs)
          }
        },
        provideMockActions(() => actions$)
      ]
    });
    effects = TestBed.inject(AccountEffects);
    userService = TestBed.inject(UserService);
  }));

  it('should load default and other accounts', () => {
    const loadAction = accountActions.AccountsLoad();
    const success = accountActions.AccountsLoadSuccess({ docs: [defaultAccountDoc].concat(accountDocs) });
    actions$ = hot('-a', { a: loadAction });
    const expected = cold('-r', { r: success });
    expect(effects.loadAccounts$).toBeObservable(expected);
  });
});
