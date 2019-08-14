import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { DebugElement, Component, Input } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { AuthService, UserinfoService, Userinfo } from 'ngx-prx-styleguide';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { Angulartics2 } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

const userinfo = new Userinfo();
userinfo.preferred_username = 'Someone';

/* tslint:disable-next-line:component-selector */
@Component({selector: 'prx-auth', template: 'mock-prx-auth'})
class MockAuthComponent { @Input() host: any; @Input() client: any; }

describe('AppComponent', () => {
  let comp: AppComponent;
  let fix: ComponentFixture<AppComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CoreModule,
        SharedModule
      ],
      declarations: [
        MockAuthComponent,
        AppComponent
      ],
      providers: [
        AuthService,
        {
          provide: UserinfoService, useValue: {
            config: () => {},
            getUserinfo: () => of(userinfo)
          }
        },
        {
          provide: Angulartics2GoogleAnalytics,
          useValue: {
            startTracking: () => {}
          }
        },
        Angulartics2
      ]
    }).compileComponents().then(() => {
      fix = TestBed.createComponent(AppComponent);
      comp = fix.componentInstance;
      fix.detectChanges();
      de = fix.debugElement;
      el = de.nativeElement;
      fix.detectChanges();
    });
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should show user info when logged in', async(() => {
    comp.userService.loggedIn = true;
    fix.detectChanges();
    expect(de.query(By.css('prx-navuser'))).not.toBeNull();
    comp.userService.loggedIn = false;
    fix.detectChanges();
    expect(de.query(By.css('prx-navuser'))).toBeNull();
  }));
});
