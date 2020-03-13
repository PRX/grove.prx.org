import { Actions } from '@ngrx/effects';
import { TestBed, async } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { of } from 'rxjs';
import { HalHttpError, MockHalDoc, ToastrService } from 'ngx-prx-styleguide';
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
  const toastrService: ToastrService = { success: jest.fn() } as any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [StoreModule.forRoot({ ...reducers }), EffectsModule.forRoot([CampaignEffects]), RouterTestingModule.withRoutes(routes)],
      providers: [
        CampaignEffects,
        {
          provide: ToastrService,
          useValue: toastrService
        },
        {
          provide: CampaignService,
          useValue: {
            loadCampaignZoomFlights: jest.fn(),
            createCampaign: jest.fn(),
            updateCampaign: jest.fn(),
            createFlight: jest.fn()
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
    campaignService.createCampaign = jest.fn(campaign => of(campaignDoc));
    campaignService.updateCampaign = jest.fn(campaign => of(campaignDoc));
    const { id, ...createCampaign } = campaignFixture;
    const createAction = new actions.CampaignSave({
      campaign: createCampaign,
      updatedFlights: [],
      createdFlights: [],
      deletedFlights: []
    });
    const updateAction = new actions.CampaignSave({
      campaign: campaignFixture,
      updatedFlights: [],
      createdFlights: [],
      deletedFlights: []
    });
    const success = new actions.CampaignSaveSuccess({
      campaignDoc,
      deletedFlightDocs: undefined,
      updatedFlightDocs: undefined,
      createdFlightDocs: undefined
    });

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
    const createAction = new actions.CampaignSave({
      campaign: createCampaign,
      updatedFlights: [],
      createdFlights: [],
      deletedFlights: []
    });
    const updateAction = new actions.CampaignSave({
      campaign: campaignFixture,
      updatedFlights: [],
      createdFlights: [],
      deletedFlights: []
    });
    const outcome = new actions.CampaignSaveFailure({ error: halError });
    actions$.stream = hot('-a-b', { a: createAction, b: updateAction });
    const expected = cold('--r-r', { r: outcome });
    expect(effects.campaignFormSave$).toBeObservable(expected);
  });

  it('should redirect to a new campaign', () => {
    const campaignDoc = new MockHalDoc(campaignFixture);
    const { id, ...createCampaign } = campaignFixture;
    campaignService.createCampaign = jest.fn(campaign => of(campaignDoc));
    const createAction = new actions.CampaignSave({
      campaign: createCampaign,
      updatedFlights: [],
      createdFlights: [],
      deletedFlights: []
    });
    const success = new actions.CampaignSaveSuccess({
      campaignDoc,
      deletedFlightDocs: undefined,
      updatedFlightDocs: undefined,
      createdFlightDocs: undefined
    });
    actions$.stream = hot('-a', { a: createAction });
    const expected = cold('-r', { r: success });
    expect(effects.campaignFormSave$).toBeObservable(expected);
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', id]);
  });

  it('should redirect to a new campaign and flight', done => {
    const campaignDoc = new MockHalDoc(campaignFixture);
    const flightDoc = new MockHalDoc(flightFixture);
    campaignService.createCampaign = jest.fn(campaign => of(campaignDoc));
    campaignService.createFlight = jest.fn(flight => of(flightDoc));

    const { id, ...newCampaign } = campaignFixture;
    const flightId = new Date().valueOf();
    const flight = { ...flightFixture, id: flightId };
    router.navigateByUrl(`/campaign/new/flight/${flightId}`).then(() => {
      const createAction = new actions.CampaignSave({
        campaign: newCampaign,
        updatedFlights: [],
        createdFlights: [flight],
        deletedFlights: []
      });
      const success = new actions.CampaignSaveSuccess({
        campaignDoc,
        deletedFlightDocs: undefined,
        updatedFlightDocs: undefined,
        createdFlightDocs: { [flightId]: flightDoc }
      });
      actions$.stream = hot('-a', { a: createAction });
      const expected = cold('-r', { r: success });
      expect(effects.campaignFormSave$).toBeObservable(expected);
      expect(router.navigate).toHaveBeenCalledWith(['/campaign', campaignFixture.id, 'flight', flightFixture.id]);
      done();
    });
  });

  it('should redirect away from a deleted flight to the campaign', done => {
    const campaignDoc = new MockHalDoc(campaignFixture);
    const flightDoc = new MockHalDoc(flightFixture);
    campaignService.updateCampaign = jest.fn(campaign => of(campaignDoc));
    campaignService.deleteFlight = jest.fn(flight => of(flightDoc));
    router.navigateByUrl(`/campaign/${campaignFixture.id}/flight/${flightFixture.id}`).then(() => {
      const deleteAction = new actions.CampaignSave({
        campaign: campaignFixture,
        updatedFlights: [],
        createdFlights: [],
        deletedFlights: [flightFixture]
      });
      const success = new actions.CampaignSaveSuccess({
        campaignDoc,
        deletedFlightDocs: { [flightFixture.id]: flightDoc },
        updatedFlightDocs: undefined,
        createdFlightDocs: undefined
      });
      actions$.stream = hot('-a', { a: deleteAction });
      const expected = cold('-r', { r: success });
      expect(effects.campaignFormSave$).toBeObservable(expected);
      expect(router.navigate).toHaveBeenCalledWith(['/campaign', campaignFixture.id]);
      done();
    });
  });

  it('should update an existing flight', () => {
    const campaignDoc = new MockHalDoc(campaignFixture);
    const flightDoc = new MockHalDoc(flightFixture);
    campaignService.updateCampaign = jest.fn(campaign => of(campaignDoc));
    campaignService.updateFlight = jest.fn(flight => of(flightDoc));

    const updateAction = new actions.CampaignSave({
      campaign: campaignFixture,
      updatedFlights: [flightFixture],
      createdFlights: [],
      deletedFlights: []
    });
    const success = new actions.CampaignSaveSuccess({
      campaignDoc,
      deletedFlightDocs: undefined,
      updatedFlightDocs: { [flightFixture.id]: flightDoc },
      createdFlightDocs: undefined
    });
    actions$.stream = hot('-a', { a: updateAction });
    const expected = cold('-r', { r: success });
    expect(effects.campaignFormSave$).toBeObservable(expected);
  });

  it('should dispatch action to add a flight with a temporary id', () => {
    const date = new Date();
    global.Date.now = jest.fn(() => date.getTime());
    const startAt = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const endAt = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1));
    const action = new actions.CampaignAddFlight({ campaignId: 1 });
    const success = new actions.CampaignAddFlightWithTempId({ flightId: date.valueOf(), startAt, endAt });
    actions$.stream = hot('a', { a: action });
    const expected = cold('r', { r: success });
    expect(effects.addFlight$).toBeObservable(expected);
  });

  it('should dispatch action to duplicate flight with a temporary id', () => {
    const flightId = Date.now();
    global.Date.now = jest.fn(() => flightId);
    const action = new actions.CampaignDupFlight({ campaignId: 1, flight: flightFixture });
    const success = new actions.CampaignDupFlightWithTempId({ flightId, flight: flightFixture });
    actions$.stream = hot('a', { a: action });
    const expected = cold('r', { r: success });
    expect(effects.dupFlight$).toBeObservable(expected);
  });
});
