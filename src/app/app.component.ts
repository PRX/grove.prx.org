import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap, first, withLatestFrom } from 'rxjs/operators';
import { AuthService, UserinfoService, Userinfo, HalDoc } from 'ngx-prx-styleguide';
import { Env } from './core/core.env';

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
    private user: UserinfoService
  ) {}

  ngOnInit() {
    this.user.config(this.authHost);
    this.userImageDoc$ = this.auth.token.pipe(
      first(),
      withLatestFrom(this.user.getUserinfo()),
      concatMap(([token, userinfo]) => {
        this.loggedIn = true;
        this.authorized = this.auth.parseToken(token);
        this.userinfo = userinfo;
        return this.user.getUserDoc(userinfo);
      })
    );
  }
}
