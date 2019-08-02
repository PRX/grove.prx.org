import { Component, OnInit } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { concatMap, first, withLatestFrom, catchError, mergeMap } from 'rxjs/operators';
import { AuthService, UserinfoService, Userinfo, HalDoc } from 'ngx-prx-styleguide';
import { Env } from './core/core.env';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

@Component({
  selector: 'grove-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  authHost = Env.AUTH_HOST;
  authClient = Env.AUTH_CLIENT_ID;

  loggedIn = true; // until proven otherwise
  authorized = false; // until proven otherwise, to avoid nav "jump"
  userinfo: Userinfo;
  userImageDoc$: Observable<HalDoc>;

  constructor(
    private auth: AuthService,
    private user: UserinfoService,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics
  ) {
    this.angulartics2GoogleAnalytics.startTracking();
  }

  ngOnInit() {
    this.user.config(this.authHost);
    this.userImageDoc$ = this.auth.token.pipe(
      first(),
      mergeMap(token => {
        if (token) {
          return combineLatest(of(token), this.user.getUserinfo());
        } else {
          return of([]);
        }
      }),
      concatMap(([token, userinfo]) => {
        if (token) {
          this.loggedIn = true;
          this.authorized = this.auth.parseToken(token);
        } else {
          this.loggedIn = false;
        }
        if (userinfo) {
          this.userinfo = userinfo;
          return this.user.getUserDoc(userinfo);
        } else {
          return of();
        }
      })
    );
  }
}
