import { Component } from '@angular/core';

import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { Env } from './core/core.env';
import { UserService } from './core/user/user.service';

@Component({
  selector: 'grove-root',
  template: `
    <prx-auth [host]="authHost" [client]="authClient"></prx-auth>
    <prx-header prxSticky="all">
      <prx-navitem *ngIf="userService.loggedIn" route="/" text="Campaigns"></prx-navitem>
      <prx-navitem *ngIf="userService.loggedIn" href="//augury.prx.org/inventory" text="Series"></prx-navitem>
      <prx-navitem *ngIf="userService.loggedIn" href="//augury.prx.org/advertisers" text="Advertisers"></prx-navitem>
      <prx-navitem *ngIf="userService.loggedIn" href="//augury.prx.org/creatives" text="Creatives"></prx-navitem>
      <prx-navuser  [userinfo]="userService.userinfo">
        <prx-spinner class="user-loading"></prx-spinner>
        <prx-image *ngIf="userService.userDoc | async as userDoc" class="user-loaded" [imageDoc]="userDoc"></prx-image>
      </prx-navuser>
    </prx-header>
    <main>
      <a routerLink="campaign/new" mat-fab color="green" aria-label="Create a new Campaign">
        <mat-icon>add</mat-icon> New Campaign
      </a>
      <article>
        <router-outlet></router-outlet>
      </article>
    </main>
    <prx-footer></prx-footer>
    <prx-modal></prx-modal>
    <prx-toastr></prx-toastr>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  authHost = Env.AUTH_HOST;
  authClient = Env.AUTH_CLIENT_ID;

  constructor(
    public userService: UserService,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics
  ) {
    this.angulartics2GoogleAnalytics.startTracking();
  }
}
