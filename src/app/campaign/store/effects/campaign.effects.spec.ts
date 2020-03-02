import { Actions } from '@ngrx/effects';
import { TestBed, async } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { of } from 'rxjs';
import { HalHttpError, MockHalDoc } from 'ngx-prx-styleguide';
import { CampaignService } from '../../../core';
import { getActions, TestActions } from '../../../store/test.actions';
import { reducers } from '../';
import { campaignFixture, flightFixture } from '../reducers/campaign-state.factory';
import * as actions from '../actions';
import { CampaignEffects } from './campaign.effects';

@Component({
  selector: 'grove-test-component',
  template: ``
})
class TestComponent {}
const campaignChildRoutes: Routes = [
  { path: '', component: TestComponent },
  { path: 'flight/:flightId', component: TestComponent }
];
const routes: Routes = [
  {
    path: 'campaign/new',
    component: TestComponent,
    children: campaignChildRoutes
  },
  {
    path: 'campaign/:id',
    component: TestComponent,
    children: campaignChildRoutes
  }
];

describe('CampaignEffects', () => {
  let effects: CampaignEffects;
  let actions$: TestActions;
  let campaignService: CampaignService;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [StoreModule.forRoot({ ...reducers }), EffectsModule.forRoot([CampaignEffects]), RouterTestingModule.withRoutes(routes)],
      providers: [
        CampaignEffects,
        {
          provide: CampaignService,
          useValue: {
            loadCampaignZoomFlights: jest.fn(),
            createCampaign: jest.fn(),
            updateCampaign: jest.fn()
          }
        },
        { provide: Actions, useFactory: getActions }
      ]
    });
    effects = TestBed.get(CampaignEffects);
    actions$ = TestBed.get(Actions);
    campaignService = TestBed.get(CampaignService);
    router = TestBed.get(Router);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  }));

  it('should load campaign with flights zoomed', () => {
    const campaignDoc = new MockHalDoc(campaignFixture);
    const flightDocs = [new MockHalDoc(flightFixture)];
    campaignService.loadCampaignZoomFlights = jest.fn(() => of({ campaignDoc, flightDocs }));
    const action = new actions.CampaignLoad({ id: 1 });
    const success = new actions.CampaignLoadSuccess({ campaignDoc, flightDocs });

    actions$.stream = hot('-a', { a: action });
    const expected = cold('-r', { r: success });
    expect(effects.campaignLoad$).toBeObservable(expected);
  });

  it('should return campaign load failure action on error', () => {
    const halError = new HalHttpError(500, 'something bad happened');
    const errorResponse = cold('-#|', {}, halError);
    campaignService.loadCampaignZoomFlights = jest.fn(() => errorResponse);

    const action = new actions.CampaignLoad({ id: 1 });
    const outcome = new actions.CampaignLoadFailure({ error: halError });

    actions$.stream = hot('-a', { a: action });
    const expected = cold('--b', { b: outcome });
    expect(effects.campaignLoad$).toBeObservable(expected);
  });

  it('should create or update campaign from campaign form save', () => {
    const campaignDoc = new MockHalDoc(campaignFixture);
    campaignService.createCampaign = jest.fn(campaign => of({ campaignDoc }));
    campaignService.updateCampaign = jest.fn(campaign => of({ campaignDoc }));
    const { id, ...createCampaign } = campaignFixture;
    const createAction = new actions.CampaignSave({ campaign: createCampaign });
    const updateAction = new actions.CampaignSave({ campaign: campaignFixture });
    const success = new actions.CampaignSaveSuccess({ campaignDoc });

    actions$.stream = hot('-a-b', { a: createAction, b: updateAction });
    const expected = cold('-r-r', { r: success });
    expect(effects.campaignFormSave$).toBeObservable(expected);
  });

  it('should return campaign form save failure action on error', () => {
    const halError = new HalHttpError(500, 'something bad happened');
    const errorResponse = cold('-#|', {}, halError);
    campaignService.createCampaign = jest.fn(() => errorResponse);
    campaignService.updateCampaign = jest.fn(() => errorResponse);

    const { id, ...createCampaign } = campaignFixture;
    const createAction = new actions.CampaignSave({ campaign: createCampaign });
    const updateAction = new actions.CampaignSave({ campaign: campaignFixture });
    const outcome = new actions.CampaignSaveFailure({ error: halError });
    actions$.stream = hot('-a-b', { a: createAction, b: updateAction });
    const expected = cold('--r-r', { r: outcome });
    expect(effects.campaignFormSave$).toBeObservable(expected);
  });

  it('redirects to a new campaign', () => {
    const campaignDoc = new MockHalDoc(campaignFixture);
    const { id, ...createCampaign } = campaignFixture;
    campaignService.createCampaign = jest.fn(campaign => of({ campaignDoc }));
    const createAction = new actions.CampaignSave({ campaign: createCampaign });
    const success = new actions.CampaignSaveSuccess({ campaignDoc });
    actions$.stream = hot('-a', { a: createAction });
    const expected = cold('-r', { r: success });
    expect(effects.campaignFormSave$).toBeObservable(expected);
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', id]);
  });
});
