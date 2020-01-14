import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, withLatestFrom, first, share } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { UserService } from '../user/user.service';

export interface Account {
  id: number;
  name: string;
  self_uri: string;
}

@Injectable()
export class AccountService {
  // tslint:disable-next-line: variable-name
  _accounts: BehaviorSubject<Account[]> = new BehaviorSubject([]);

  get accounts(): Observable<Account[]> {
    return this._accounts.asObservable();
  }

  constructor(private user: UserService) {}

  loadAccounts(): Observable<Account[]> {
    const result = this.user.accounts.pipe(
      withLatestFrom(this.user.defaultAccount),
      map(([accounts, defaultAccount]) => {
        return [defaultAccount].concat(accounts).map(this.docToAccount);
      }),
      share()
    );

    result.pipe(first()).subscribe(accounts => this._accounts.next(accounts));

    return result;
  }

  docToAccount(doc: HalDoc): Account {
    const account = doc.asJSON() as Account;
    account.self_uri = doc.expand('self');
    return account;
  }
}
