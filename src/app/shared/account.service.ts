import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { UserService } from '../core/user/user.service';

export interface Account {
  id: number;
  name: string;
  self_uri: string;
}

@Injectable()
export class AccountService {
  constructor(private user: UserService) {}

  listAccounts(params = {}): Observable<Account[]> {
    return this.user.accounts.pipe(
      withLatestFrom(this.user.defaultAccount),
      map(([accounts, defaultAccount]) => {
        return [defaultAccount].concat(accounts).map(this.docToAccount);
      })
    );
  }

  docToAccount(doc: HalDoc): Account {
    const account = <Account>doc.asJSON();
    account.self_uri = doc.expand('self');
    return account;
  }
}
