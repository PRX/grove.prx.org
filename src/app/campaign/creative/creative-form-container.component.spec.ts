import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { Store, StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { first } from 'rxjs/operators';
import { CustomRouterSerializer } from '../../store/router-store/custom-router-serializer';
import { reducers } from '../store';
import * as creativeActions from '../store/actions/creative-action.creator';
import { SharedModule } from '../../shared/shared.module';
import { CreativeFormContainerComponent } from './creative-form-container.component';
import { CreativeFormComponent } from './creative-form.component';
import { CreativePingbacksFormComponent } from './pingbacks/creative-pingbacks-form.component';
import { PingbackFormComponent } from './pingbacks/pingback-form.component';
import { ActivatedRouteStub } from '../../../testing/stub.router';
import { TestComponent } from '../../../testing/test.component';
import { Creative } from '../store/models';
import { creativesFixture } from '../store/models/campaign-state.factory';
import { MockHalDoc } from 'ngx-prx-styleguide';

const creativeFixture: Creative = {
  id: 1,
  url: 'https://some.url/somewhere/something.mp3',
  filename: 'something'
};

const flightChildRoutes: Routes = [{ path: 'zone/:zoneId/creative/:creativeId', component: CreativeFormContainerComponent }];
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

describe('CreativeFormContainerComponent', () => {
  let comp: CreativeFormContainerComponent;
  let fix: ComponentFixture<CreativeFormContainerComponent>;
  let router: Router;
  let store: Store<any>;
  const route: ActivatedRouteStub = new ActivatedRouteStub();
  let dispatchSpy: jest.SpyInstance;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(campaignRoutes),
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatIconModule,
        MatToolbarModule,
        SharedModule,
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
      declarations: [
        CreativeFormContainerComponent,
        CreativeFormComponent,
        CreativePingbacksFormComponent,
        PingbackFormComponent,
        TestComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: route
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fix = TestBed.createComponent(CreativeFormContainerComponent);
        comp = fix.componentInstance;
        router = TestBed.inject(Router);
        store = TestBed.inject(Store);
        fix.detectChanges();

        fix.ngZone.run(() => router.navigateByUrl(`/campaign/1/flight/1/zone/pre_1/creative/1`));

        dispatchSpy = jest.spyOn(store, 'dispatch');
      });
  }));

  it('dispatches action to load a creative by id', done => {
    fix.ngZone.run(() => {
      router.navigateByUrl('/campaign/1/flight/1/zone/pre_1/creative/2');
      route.setParamMap({ id: '1', flightI: 1, zoneId: 'pre_1', creativeId: 2 });
      route.paramMap.pipe(first()).subscribe(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(creativeActions.CreativeLoad({ id: 2 }));
        done();
      });
    });
  });

  it('dispatches action to set up a new creative', done => {
    fix.ngZone.run(() => {
      router.navigateByUrl('/campaign/1/flight/1/zone/pre_1/creative/new');
      route.setParamMap({ id: '1', flightI: 1, zoneId: 'pre_1', creativeId: 'new' });
      route.paramMap.pipe(first()).subscribe(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(creativeActions.CreativeNew());
        done();
      });
    });
  });

  it('dispatches action to update the creative form', () => {
    comp.onFormUpdate({ creative: creativeFixture, changed: true, valid: true });
    expect(dispatchSpy).toHaveBeenCalledWith(creativeActions.CreativeFormUpdate({ creative: creativeFixture, changed: true, valid: true }));
  });

  it('dispatches action to save creative by create or update', () => {
    store.dispatch(creativeActions.CreativeNew());
    dispatchSpy.mockClear();
    comp.onSave(creativesFixture[0]);
    expect(dispatchSpy).toHaveBeenCalledWith(
      creativeActions.CreativeCreate({ campaignId: 1, flightId: 1, zoneId: 'pre_1', creative: creativesFixture[0] })
    );

    const creativeDoc = new MockHalDoc(creativesFixture[0]);
    const creative = { ...creativesFixture[1], id: creativesFixture[0].id };
    store.dispatch(creativeActions.CreativeLoadSuccess({ creativeDoc }));
    dispatchSpy.mockClear();
    comp.onSave(creative);
    expect(dispatchSpy).toHaveBeenCalledWith(
      creativeActions.CreativeUpdate({ campaignId: 1, flightId: 1, zoneId: 'pre_1', creative, creativeDoc })
    );
  });

  it('navigates back to flight on cancel', () => {
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    comp.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', 1, 'flight', 1]);
  });
});
