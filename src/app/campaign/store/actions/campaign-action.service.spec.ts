import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store, select } from '@ngrx/store';
import { CampaignStoreService } from '../../../core';
import { reducers } from '../';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../../../store/router-store/custom-router-serializer';
import * as actions from './campaign-action.creator';
import { selectCampaignId, selectCampaignWithFlightsForSave } from '../selectors';
import { campaignFixture, campaignDocFixture, flightFixture, flightDocFixture } from '../models/campaign-state.factory';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { TestComponent, campaignRoutes } from '../../../../testing/test.component';
import { CampaignActionService } from './campaign-action.service';
import { AllocationPreviewActionService } from './allocation-preview-action.service';

describe('CampaignActionService', () => {
  let router: Router;
  let store: Store<any>;
  let campaignStoreService: CampaignStoreService;
  let allocationPreviewActionService: AllocationPreviewActionService;
  let service: CampaignActionService;
  let dispatchSpy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        RouterTestingModule.withRoutes(campaignRoutes),
        StoreModule.forRoot({ router: routerReducer }),
        StoreRouterConnectingModule.forRoot({ serializer: CustomRouterSerializer }),
        StoreModule.forFeature('campaignState', reducers)
      ],
      providers: [
        AllocationPreviewActionService,
        CampaignActionService,
        {
          provide: CampaignStoreService,
          useValue: {
            loadAvailability: jest.fn(() => {})
          }
        }
      ]
    });
    service = TestBed.get(CampaignActionService);
    allocationPreviewActionService = TestBed.get(AllocationPreviewActionService);
    campaignStoreService = TestBed.get(CampaignStoreService);
    router = TestBed.get(Router);
    store = TestBed.get(Store);

    router.navigateByUrl(`/campaign/${campaignFixture.id}/flight/${flightFixture.id}`);

    const flightIds = [flightFixture.id, flightFixture.id + 1, flightFixture.id + 2, flightFixture.id + 3];
    const campaignDoc = new MockHalDoc(campaignDocFixture);
    const flightDocs = [
      new MockHalDoc({ ...flightDocFixture, id: flightIds[0] }),
      new MockHalDoc({ ...flightDocFixture, id: flightIds[1] }),
      new MockHalDoc({ ...flightDocFixture, id: flightIds[2] }),
      new MockHalDoc({ ...flightDocFixture, id: flightIds[3] })
    ];
    const loadAction = new actions.CampaignLoadSuccess({ campaignDoc, flightDocs });
    store.dispatch(loadAction);
    const goalAction = new actions.CampaignFlightSetGoal({ flightId: flightIds[0], totalGoal: 999, dailyMinimum: 9, valid: true });
    store.dispatch(goalAction);

    dispatchSpy = jest.spyOn(store, 'dispatch');
    jest.spyOn(allocationPreviewActionService, 'loadAllocationPreview');
  });

  it('should load availability from flight id change', () => {
    expect(campaignStoreService.loadAvailability).toHaveBeenCalledWith({ MOCKS: {}, ERRORS: {}, ...flightFixture });
  });

  it('should load availability and allocation preview when flight form is updated', () => {
    service.updateFlightForm({ ...flightFixture, endAt: new Date() }, true, true);
    expect(campaignStoreService.loadAvailability).toHaveBeenCalled();
    expect(allocationPreviewActionService.loadAllocationPreview).toHaveBeenCalled();
  });

  it('should not load allocation preview if flight name changes', () => {
    const flight = { ...flightFixture, name: 'new name' };
    service.updateFlightForm(flight, true, false);
    expect(allocationPreviewActionService.loadAllocationPreview).not.toHaveBeenCalled();
  });

  it('should dispatch action to load campaign options', () => {
    service.loadCampaignOptions();
    expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignLoadOptions());
  });

  it('should dispatch action to setup new campaign', () => {
    service.newCampaign();
    expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignNew());
  });

  it('should dispatch action to load campaign', () => {
    service.loadCampaign(1);
    expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignLoad({ id: 1 }));
  });

  it('should dispatch action to update the campaign from the form', () => {
    const changed = true;
    const valid = false;
    service.updateCampaignForm(campaignFixture, true, false);
    expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignFormUpdate({ campaign: campaignFixture, changed, valid }));
  });

  it('should dispatch aciton to set campaign advertiser', () => {
    // tslint:disable-next-line: variable-name
    const set_advertiser_uri = '/some/advertiser';
    service.setCampaignAdvertiser(set_advertiser_uri);
    expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignSetAdvertiser({ set_advertiser_uri }));
  });

  it('should dispatch action to add a new flight', done => {
    service.addFlight();
    store.pipe(select(selectCampaignId)).subscribe(campaignId => {
      expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignAddFlight({ campaignId }));
      done();
    });
  });

  it('should dispatch action to duplicate flight', done => {
    service.dupFlight(flightFixture);
    store.pipe(select(selectCampaignId)).subscribe(campaignId => {
      expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignDupFlight({ campaignId, flight: flightFixture }));
      done();
    });
  });

  it('should dispatch action to toggle flight deletion', () => {
    service.deleteRoutedFlightToggle();
    expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignDeleteFlight({ id: flightFixture.id, softDeleted: true }));
  });

  it('should dispatch action to update flight form', () => {
    const flight = { ...flightFixture, name: 'new name' };
    service.updateFlightForm(flight, true, false);
    expect(dispatchSpy).toHaveBeenCalledWith(
      new actions.CampaignFlightFormUpdate({
        flight,
        changed: true,
        valid: false
      })
    );
  });

  it('should dispatch action to set flight goal', () => {
    const flightId = flightFixture.id;
    const totalGoal = 1000;
    const dailyMinimum = 10;
    service.setFlightGoal(flightId, totalGoal, dailyMinimum);
    expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignFlightSetGoal({ flightId, totalGoal, dailyMinimum, valid: true }));
  });

  it('should load availibility preview when total goal is changed', () => {
    const flightId = flightFixture.id;
    const totalGoal = 1000;
    const dailyMinimum = 10;
    service.setFlightGoal(flightId, totalGoal, dailyMinimum);
    expect(allocationPreviewActionService.loadAllocationPreview).toHaveBeenCalled();
  });

  it('should dispatch action to save campaign and flights', done => {
    service.saveCampaignAndFlights();
    store.pipe(select(selectCampaignWithFlightsForSave)).subscribe(campaignFlights => {
      expect(dispatchSpy).toHaveBeenCalledWith(new actions.CampaignSave(campaignFlights));
      done();
    });
  });
});
