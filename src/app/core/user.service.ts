import { Injectable } from '@angular/core';
import { of, combineLatest, Observable } from 'rxjs';
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
  userDoc: HalDoc;

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
    ).subscribe(userDoc => this.userDoc = userDoc);
  }

  get accounts(): Observable<HalDoc[]> {
    return this.userDoc && this.userDoc.followItems('prx:accounts');
  }
}
