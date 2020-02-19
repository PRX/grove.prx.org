import { Actions } from '@ngrx/effects';
import { TestBed, async } from '@angular/core/testing';
import { cold, hot } from 'jasmine-marbles';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { of } from 'rxjs';
import { HalHttpError } from 'ngx-prx-styleguide';
import { CampaignService } from '../../../core';
import { getActions, TestActions } from '../../../store/test.actions';
import { reducers } from '../';
import { campaignFixture, flightFixture } from '../reducers/campaign-state.factory';
import * as ACTIONS from '../actions';
import { CampaignEffects } from './campaign.effects';

describe('CampaignEffects', () => {
  let effects: CampaignEffects;
  let actions$: TestActions;
  let campaignService: CampaignService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ ...reducers }), EffectsModule.forRoot([CampaignEffects])],
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
  }));

  it('should load campaign with flights zoomed', () => {
    campaignService.loadCampaignZoomFlights = jest.fn(() => of({ campaign: campaignFixture, flights: [flightFixture] }));
    const action = new ACTIONS.CampaignLoad({ id: 1 });
    const success = new ACTIONS.CampaignLoadSuccess({ campaign: campaignFixture });

    actions$.stream = hot('-a', { a: action });
    const expected = cold('-r', { r: success });
    expect(effects.campaignLoad$).toBeObservable(expected);
  });

  it('should return campaign load failure action on error', () => {
    const halError = new HalHttpError(500, 'something bad happened');
    const errorResponse = cold('-#|', {}, halError);
    campaignService.loadCampaignZoomFlights = jest.fn(() => errorResponse);

    const action = new ACTIONS.CampaignLoad({ id: 1 });
    const outcome = new ACTIONS.CampaignLoadFailure(halError);

    actions$.stream = hot('-a', { a: action });
    const expected = cold('--b', { b: outcome });
    expect(effects.campaignLoad$).toBeObservable(expected);
  });

  it('should create or update campaign from campaign form save', () => {
    campaignService.createCampaign = jest.fn(campaign => of({ ...campaign, id: 1 }));
    campaignService.updateCampaign = jest.fn(campaign => of(campaign));
    const { id, ...createCampaign } = campaignFixture;
    const createAction = new ACTIONS.CampaignFormSave({ campaign: createCampaign });
    const updateAction = new ACTIONS.CampaignFormSave({ campaign: campaignFixture });
    const success = new ACTIONS.CampaignFormSaveSuccess({ campaign: campaignFixture });

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
    const createAction = new ACTIONS.CampaignFormSave({ campaign: createCampaign });
    const updateAction = new ACTIONS.CampaignFormSave({ campaign: campaignFixture });
    const outcome = new ACTIONS.CampaignFormSaveFailure(halError);
    actions$.stream = hot('-a-b', { a: createAction, b: updateAction });
    const expected = cold('--r-r', { r: outcome });
    expect(effects.campaignFormSave$).toBeObservable(expected);
  });
});
