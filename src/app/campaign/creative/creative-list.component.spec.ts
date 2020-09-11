import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, MatPaginatorModule, MatToolbarModule } from '@angular/material';
import { Store, StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../../store/router-store/custom-router-serializer';
import { reducers } from '../store';
import { SharedModule } from '../../shared/shared.module';
import { TestComponent } from '../../../testing/test.component';
import { CreativeListComponent } from './creative-list.component';

const flightChildRoutes: Routes = [{ path: 'zone/:zoneId/creative/list', component: CreativeListComponent }];
const campaignChildRoutes: Routes = [
  { path: '', component: TestComponent },
  { path: 'flight/:flightId', component: TestComponent, children: flightChildRoutes }
];
const campaignRoutes: Routes = [
  {
    path: 'campaign/:id',
    component: TestComponent,
    children: campaignChildRoutes
  }
];

describe('CreativeListComponent', () => {
  let comp: CreativeListComponent;
  let fix: ComponentFixture<CreativeListComponent>;
  let de: DebugElement;
  let router: Router;
  let store: Store<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RouterTestingModule.withRoutes(campaignRoutes),
        NoopAnimationsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatPaginatorModule,
        MatToolbarModule,
        StoreModule.forRoot(
          { router: routerReducer },
          {
            runtimeChecks: {
              strictStateImmutability: true,
              strictActionImmutability: true
            }
          }
        ),
        StoreRouterConnectingModule.forRoot({ serializer: CustomRouterSerializer }),
        StoreModule.forFeature('campaignState', reducers)
      ],
      declarations: [CreativeListComponent, TestComponent]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CreativeListComponent);
        comp = fix.componentInstance;
        de = fix.debugElement;
        fix.detectChanges();
        router = TestBed.get(Router);
        store = TestBed.get(Store);

        // store.dispatch(creatuve.CreativeLoadListSuccess({  }));
        fix.ngZone.run(() => router.navigateByUrl('/campaign/1/flight/1/zone/pre_1/creative/list'));
      });
  }));

  it('', () => {});
});
