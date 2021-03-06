import { Injectable } from '@angular/core';
import { of, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { concatMap, first, filter } from 'rxjs/operators';
import { AuthService, UserinfoService, Userinfo, HalDoc } from 'ngx-prx-styleguide';
import { Env } from '../core.env';

@Injectable()
export class UserService {
  authHost = Env.AUTH_HOST;
  authClient = Env.AUTH_CLIENT_ID;

  loggedIn = true; // until proven otherwise
  authorized = false; // until proven otherwise, to avoid nav "jump"
  userinfo: Userinfo;

  // tslint:disable-next-line: variable-name
  private _userDoc = new ReplaySubject<HalDoc>(1);
  get userDoc(): Observable<HalDoc> {
    return this._userDoc.asObservable();
  }

  constructor(private authService: AuthService, private userinfoService: UserinfoService) {
    this.loadUser();
  }

  loadUser() {
    this.userinfoService.config(this.authHost);
    this.authService.token
      .pipe(
        first(),
        concatMap(token => {
          if (token) {
            return combineLatest([of(token), this.userinfoService.getUserinfo()]);
          } else {
            return of([]);
          }
        }),
        concatMap(
          ([token, userinfo]): Observable<HalDoc> => {
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
          }
        )
      )
      .subscribe(doc => {
        this._userDoc.next(doc);
      });
  }

  get accounts(): Observable<HalDoc[]> {
    return this.userDoc.pipe(
      concatMap(doc => {
        const per = doc && doc['_links']['prx:accounts']['count'];
        return doc ? doc.followItems('prx:accounts', { per }) : of([]);
      })
    );
  }

  get defaultAccount(): Observable<HalDoc> {
    return this.userDoc.pipe(
      filter(doc => !!doc),
      concatMap(doc => doc.follow('prx:default-account'))
    );
  }
}
