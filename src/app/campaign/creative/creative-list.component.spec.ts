import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Store, StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../../store/router-store/custom-router-serializer';
import { reducers } from '../store';
import * as campaignActions from '../store/actions/campaign-action.creator';
import * as creativeActions from '../store/actions/creative-action.creator';
import { creativesFixture, advertisersFixture } from '../store/models/campaign-state.factory';
import { SharedModule } from '../../shared/shared.module';
import { TestComponent } from '../../../testing/test.component';
import { CreativeListComponent } from './creative-list.component';
import { MockHalDoc } from 'ngx-prx-styleguide';

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
        router = TestBed.get(Router);
        store = TestBed.get(Store);

        store.dispatch(
          creativeActions.CreativeLoadListSuccess({
            params: {},
            total: creativesFixture.length,
            docs: creativesFixture.map(creative => ({
              creativeDoc: new MockHalDoc(creative),
              advertiserDoc: new MockHalDoc(advertisersFixture[0])
            }))
          })
        );
        fix.ngZone.run(() => router.navigateByUrl('/campaign/1/flight/1/zone/pre_1/creative/list'));
        fix.detectChanges();

        jest.spyOn(store, 'dispatch');
      });
  }));

  it('shows creative selection list', () => {
    const creatives = de.queryAll(By.css('mat-list-option'));
    expect(creatives.length).toEqual(creativesFixture.length);
    expect(creatives[0].nativeElement.textContent).toContain(creativesFixture[0].filename);
  });

  it('pages creative list', () => {
    comp.onPage({ page: 2, per: 5 });
    expect(store.dispatch).toHaveBeenCalledWith(creativeActions.CreativeLoadList({ params: { page: 2, per: 5 } }));
  });

  it('searches creative list and debounces input', done => {
    comp.searchOutput$.subscribe(search => {
      expect(store.dispatch).toHaveBeenCalledWith(creativeActions.CreativeLoadList({ params: { text: 'abcdefghi' } }));
      done();
    });
    comp.onSearch('abcdef');
    comp.onSearch('abcdefghi');
  });

  it('dispatches action to add flight zone creatives', () => {
    comp.selectedCreativeIds = { 1: [1, 2], 2: [3, 4] };
    comp.onSave();
    expect(store.dispatch).toHaveBeenCalledWith(
      campaignActions.CampaignFlightZoneAddCreatives({ flightId: 1, zoneId: 'pre_1', creativeIds: [1, 2, 3, 4] })
    );
  });

  it('navigates back to flight on cancel', () => {
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    comp.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', 1, 'flight', 1]);
  });
});
