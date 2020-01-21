import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Account } from './account.service';

export const accounts: Account[] = [
  {
    id: 1,
    name: 'Person',
    self_uri: '/api/v1/accounts/1'
  },
  {
    id: 28,
    name: 'A Group Account',
    self_uri: '/api/v1/accounts/28'
  }
];

@Injectable()
export class AccountServiceMock {
  // tslint:disable-next-line: variable-name
  _accounts = new BehaviorSubject<Account[]>(accounts);

  loadAccounts(): Observable<Account[]> {
    return this.accounts;
  }

  get accounts(): Observable<Account[]> {
    return this._accounts.asObservable();
  }
}
