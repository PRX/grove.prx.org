import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MockHalDoc, Userinfo } from 'ngx-prx-styleguide';

@Injectable()
export class UserServiceMock {
  loggedIn = true;
  authorized = false;
  userinfo: Userinfo;

  constructor() {
    this.loadUser();
  }

  get userDoc(): Observable<MockHalDoc> {
    return of(new MockHalDoc({
      firstName: 'Grove',
      id: 1,
      lastName: 'User',
      login: 'groveuser'
    }));
  }

  loadUser() {
    this.authorized = true;
    this.userinfo = {
      sub: 1,
      name: 'Grove User',
      given_name: 'Grove',
      family_name: 'User',
      preferred_username: 'groveuser',
      apps: {
        'Grove Docker SSL': 'https://grove.prx.docker'
      },
      href: 'https://cms.faking.prx.tech/api/v1/users/1'
    };
  }

  get accounts(): Observable<MockHalDoc[]> {
    return of([
      new MockHalDoc({
        description: 'Grove users',
        id: 11,
        kind: 'group',
        name: 'Grove User Group',
        path: 'GroveUsers',
        shortName: 'Grove User',
        type: 'GroupAccount'
      })
    ]);
  }

  get defaultAccount(): Observable<MockHalDoc> {
    return of(new MockHalDoc({
      description: 'my account',
      id: 12,
      kind: 'individual',
      name: 'my account',
      path: 'myaccount',
      shortName: 'My Account',
      type: 'IndividualAccount'
    }));
  }
}
