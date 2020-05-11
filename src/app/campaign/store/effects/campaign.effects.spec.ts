import { Actions } from '@ngrx/effects';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { of } from 'rxjs';
import { HalHttpError, MockHalDoc, ToastrService, MockHalService } from 'ngx-prx-styleguide';
import { CampaignService, AuguryService } from '../../../core';
import { getActions, TestActions } from '../../../store/test.actions';
import { TestComponent, campaignRoutes } from '../../../../testing/test.component';
import { reducers } from '../';
import { campaignFixture, flightFixture, flightDocFixture, flightDaysData } from '../models/campaign-state.factory';
import * as campaignActions from '../actions/campaign-action.creator';
import { CampaignEffects } from './campaign.effects';

describe('CampaignEffects', () => {
  let effects: CampaignEffects;
  let actions$: TestActions;
  let campaignService: CampaignService;
  let router: Router;
  let fixture: ComponentFixture<TestComponent>;
  const toastrService: ToastrService = { success: jest.fn() } as any;
  const campaignDoc = new MockHalDoc(campaignFixture);
  const flightDocs = [new MockHalDoc(flightDocFixture)];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        StoreModule.forRoot({ ...reducers }),
        EffectsModule.forRoot([CampaignEffects]),
        RouterTestingModule.withRoutes(campaignRoutes)
      ],
      providers: [
        CampaignEffects,
        {
          provide: ToastrService,
          useValue: toastrService
        },
        {
          provide: CampaignService,
          useValue: {
            loadCampaignZoomFlightsAndFlightDays: jest.fn(),
            loadFlightDays: jest.fn(),
            createCampaign: jest.fn(),
            updateCampaign: jest.fn(),
            createFlight: jest.fn()
          }
        },
        { provide: Actions, useFactory: getActions },
        {
          provide: AuguryService,
          userValue: new MockHalService()
        }
      ]
    });
    fixture = TestBed.createComponent(TestComponent);
    effects = TestBed.get(CampaignEffects);
    actions$ = TestBed.get(Actions);
    campaignService = TestBed.get(CampaignService);
    router = TestBed.get(Router);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
  }));

  it('should load campaign with flights and flights days zoomed', () => {
    campaignService.loadCampaignZoomFlightsAndFlightDays = jest.fn(() =>
      of({ campaignDoc, flightDocs, flightDaysDocs: { [flightFixture.id]: (flightDaysData as any[]) as MockHalDoc[] } })
    );
    const action = new campaignActions.CampaignLoad({ id: 1 });
    const success = new campaignActions.CampaignLoadSuccess({
      campaignDoc,
      flightDocs,
      flightDaysDocs: { [flightFixture.id]: (flightDaysData as any[]) as MockHalDoc[] }
    });

    actions$.stream = hot('-a', { a: action });
    const expected = cold('-r', { r: success });
    expect(effects.campaignLoad$).toBeObservable(expected);
  });

  it('should return campaign load failure action on error', () => {
    const halError = new HalHttpError(500, 'something bad happened');
    const errorResponse = cold('#', {}, halError);
    campaignService.loadCampaignZoomFlightsAndFlightDays = jest.fn(() => errorResponse);

    const action = new campaignActions.CampaignLoad({ id: 1 });
    const outcome = new campaignActions.CampaignLoadFailure({ error: halError });

    actions$.stream = hot('-a', { a: action });
    const expected = cold('-(b|)', { b: outcome });
    expect(effects.campaignLoad$).toBeObservable(expected);
  });

  it('should create or update campaign from campaign form save', () => {
    campaignService.createCampaign = jest.fn(() => of(campaignDoc));
    campaignService.updateCampaign = jest.fn(() => of(campaignDoc));
    const { id, ...createCampaign } = campaignFixture;
    const createAction = new campaignActions.CampaignSave({
      campaign: createCampaign,
      campaignDoc: undefined,
      updatedFlights: [],
      createdFlights: [],
      deletedFlights: [],
      tempDeletedFlights: []
    });
    const updateAction = new campaignActions.CampaignSave({
      campaign: campaignFixture,
      campaignDoc,
      updatedFlights: [],
      createdFlights: [],
      deletedFlights: [],
      tempDeletedFlights: []
    });
    const success = new campaignActions.CampaignSaveSuccess({
      campaignDoc,
      deletedFlightDocs: undefined,
      updatedFlightDocs: undefined,
      updatedFlightDaysDocs: {},
      createdFlightDocs: undefined,
      createdFlightDaysDocs: {}
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
    const createAction = new campaignActions.CampaignSave({
      campaign: createCampaign,
      campaignDoc: undefined,
      updatedFlights: [],
      createdFlights: [],
      deletedFlights: [],
      tempDeletedFlights: []
    });
    const updateAction = new campaignActions.CampaignSave({
      campaign: campaignFixture,
      campaignDoc,
      updatedFlights: [],
      createdFlights: [],
      deletedFlights: [],
      tempDeletedFlights: []
    });
    const outcome = new campaignActions.CampaignSaveFailure({ error: halError });
    actions$.stream = hot('-a-b', { a: createAction, b: updateAction });
    const expected = cold('--r-r', { r: outcome });
    expect(effects.campaignFormSave$).toBeObservable(expected);
  });

  it('should redirect to a new campaign', () => {
    const { id, ...createCampaign } = campaignFixture;
    campaignService.createCampaign = jest.fn(() => of(campaignDoc));
    const createAction = new campaignActions.CampaignSave({
      campaign: createCampaign,
      campaignDoc: undefined,
      updatedFlights: [],
      createdFlights: [],
      deletedFlights: [],
      tempDeletedFlights: []
    });
    const success = new campaignActions.CampaignSaveSuccess({
      campaignDoc,
      deletedFlightDocs: undefined,
      updatedFlightDocs: undefined,
      updatedFlightDaysDocs: {},
      createdFlightDocs: undefined,
      createdFlightDaysDocs: {}
    });
    actions$.stream = hot('-a', { a: createAction });
    const expected = cold('-r', { r: success });
    expect(effects.campaignFormSave$).toBeObservable(expected);
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', id]);
  });

  it('should redirect to a new campaign and flight', done => {
    campaignService.createCampaign = jest.fn(() => of(campaignDoc));
    campaignService.createFlight = jest.fn(() => of(flightDocs[0]));
    campaignService.loadFlightDays = jest.fn(() => of((flightDaysData as any[]) as MockHalDoc[]));

    const { id, ...newCampaign } = campaignFixture;
    const tempFlightId = new Date().valueOf();
    const flight = { ...flightFixture, id: tempFlightId };
    fixture.ngZone.run(() => {
      router.navigateByUrl(`/campaign/new/flight/${tempFlightId}`).then(() => {
        const createAction = new campaignActions.CampaignSave({
          campaign: newCampaign,
          campaignDoc: undefined,
          updatedFlights: [],
          createdFlights: [flight],
          deletedFlights: [],
          tempDeletedFlights: []
        });
        const success = new campaignActions.CampaignSaveSuccess({
          campaignDoc,
          deletedFlightDocs: undefined,
          updatedFlightDocs: undefined,
          updatedFlightDaysDocs: {},
          createdFlightDocs: { [tempFlightId]: flightDocs[0] },
          createdFlightDaysDocs: { [flightFixture.id]: (flightDaysData as any[]) as MockHalDoc[] }
        });
        actions$.stream = hot('-a', { a: createAction });
        const expected = cold('-r', { r: success });
        expect(effects.campaignFormSave$).toBeObservable(expected);
        expect(router.navigate).toHaveBeenCalledWith(['/campaign', campaignFixture.id, 'flight', flightFixture.id]);
        done();
      });
    });
  });

  it('should redirect away from a deleted flight to the campaign', done => {
    campaignService.updateCampaign = jest.fn(() => of(campaignDoc));
    campaignService.deleteFlight = jest.fn(() => of(flightDocs[0]));
    fixture.ngZone.run(() => {
      router.navigateByUrl(`/campaign/${campaignFixture.id}/flight/${flightFixture.id}`).then(() => {
        const deleteAction = new campaignActions.CampaignSave({
          campaign: campaignFixture,
          campaignDoc,
          updatedFlights: [],
          createdFlights: [],
          deletedFlights: [flightFixture],
          tempDeletedFlights: []
        });
        const success = new campaignActions.CampaignSaveSuccess({
          campaignDoc,
          deletedFlightDocs: { [flightFixture.id]: flightDocs[0] },
          updatedFlightDocs: undefined,
          updatedFlightDaysDocs: {},
          createdFlightDocs: undefined,
          createdFlightDaysDocs: {}
        });
        actions$.stream = hot('-a', { a: deleteAction });
        const expected = cold('-r', { r: success });
        expect(effects.campaignFormSave$).toBeObservable(expected);
        expect(router.navigate).toHaveBeenCalledWith(['/campaign', campaignFixture.id]);
        done();
      });
    });
  });

  it('should update an existing flight', () => {
    campaignService.updateCampaign = jest.fn(() => of(campaignDoc));
    campaignService.updateFlight = jest.fn(() => of(flightDocs[0]));
    campaignService.loadFlightDays = jest.fn(() => of((flightDaysData as any[]) as MockHalDoc[]));

    const updateAction = new campaignActions.CampaignSave({
      campaign: campaignFixture,
      campaignDoc,
      updatedFlights: [flightFixture],
      createdFlights: [],
      deletedFlights: [],
      tempDeletedFlights: []
    });
    const success = new campaignActions.CampaignSaveSuccess({
      campaignDoc,
      deletedFlightDocs: undefined,
      updatedFlightDocs: { [flightFixture.id]: flightDocs[0] },
      // updatedFlightDaysDocs: { [flightFixture.id]: flightDaysData.map(d => new MockHalDoc(d)) },
      updatedFlightDaysDocs: { [flightFixture.id]: (flightDaysData as any[]) as MockHalDoc[] },
      createdFlightDocs: undefined,
      createdFlightDaysDocs: {}
    });
    actions$.stream = hot('-a', { a: updateAction });
    const expected = cold('-r', { r: success });
    expect(effects.campaignFormSave$).toBeObservable(expected);
  });

  it('should navigate to flight added with temporary id', () => {
    const action = new campaignActions.CampaignAddFlight({ campaignId: 1 });
    actions$.stream = hot('a', { a: action });
    const expected = cold('r', { r: undefined });
    expect(effects.addFlight$).toBeObservable(expected);
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', 1, 'flight', action.payload.flightId]);
  });

  it('should navigate to flight duplicated with a temporary id', () => {
    const action = new campaignActions.CampaignDupFlight({ campaignId: 1, flight: flightFixture });
    actions$.stream = hot('a', { a: action });
    const expected = cold('r', { r: undefined });
    expect(effects.dupFlight$).toBeObservable(expected);
    expect(router.navigate).toHaveBeenCalledWith(['/campaign', 1, 'flight', action.payload.flightId]);
  });

  it('should get campaign and flights to duplicate by id', () => {
    campaignService.loadCampaignZoomFlights = jest.fn(() => of({ campaignDoc, flightDocs }));
    const action = new campaignActions.CampaignDupById({ id: campaignFixture.id });
    const success = new campaignActions.CampaignDupByIdSuccess({ campaignDoc, flightDocs, timestamp: Date.now() });
    actions$.stream = hot('a', { a: action });
    const expected = cold('r', { r: success });
    expect(effects.dupCampaignById$).toBeObservable(expected);
  });
});
