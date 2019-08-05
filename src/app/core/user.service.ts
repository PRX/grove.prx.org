import { Injectable } from '@angular/core';
import { of, combineLatest, Observable, BehaviorSubject } from 'rxjs';
import { concatMap, first, tap } from 'rxjs/operators';
import { AuthService, UserinfoService, Userinfo, HalDoc } from 'ngx-prx-styleguide';
import { Env } from './core.env';

@Injectable()
export class UserService {
  authHost = Env.AUTH_HOST;
  authClient = Env.AUTH_CLIENT_ID;

  loggedIn = true; // until proven otherwise
  authorized = false; // until proven otherwise, to avoid nav "jump"
  userinfo: Userinfo;

  // tslint:disable-next-line: variable-name
  private _userDoc = new BehaviorSubject(null);
  get userDoc(): Observable<HalDoc> {
    return this._userDoc.asObservable();
  }

  constructor(private authService: AuthService,
              private userinfoService: UserinfoService) {
    this.loadUser();
  }

  loadUser() {
    this.userinfoService.config(this.authHost);
    this.authService.token.pipe(
      first(),
      concatMap(token => {
        if (token) {
          return combineLatest(of(token), this.userinfoService.getUserinfo());
        } else {
          return of([]);
        }
      }),
      concatMap(([token, userinfo]) => {
        if (token) {
          this.loggedIn = true;
          this.authorized = this.authService.parseToken(token);
        } else {
          this.loggedIn = false;
        }
        if (userinfo) {
          this.userinfo = userinfo;
          return this.userinfoService.getUserDoc(userinfo);
        } else {
          return of();
        }
      }),
      tap(console.log)
    ).subscribe(doc => {
      this._userDoc.next(doc);
    });
  }

  get accounts(): Observable<HalDoc[]> {
    return this.userDoc.pipe(
      concatMap(doc => doc ? doc.followItems('prx:accounts') : of([]))
    );
  }
}
