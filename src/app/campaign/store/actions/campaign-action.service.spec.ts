import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store, select } from '@ngrx/store';
import { reducers } from '../';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../../../store/router-store/custom-router-serializer';
import * as campaignActions from './campaign-action.creator';
import * as allocationPreviewActions from './allocation-preview-action.creator';
import { selectCampaignId, selectCampaignWithFlightsForSave } from '../selectors';
import { campaignFixture, campaignDocFixture, flightFixture, flightDocFixture } from '../models/campaign-state.factory';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { TestComponent, campaignRoutes } from '../../../../testing/test.component';
import { CampaignActionService } from './campaign-action.service';

describe('CampaignActionService', () => {
  let router: Router;
  let store: Store<any>;
  let service: CampaignActionService;
  let fixture: ComponentFixture<TestComponent>;
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
      providers: [CampaignActionService]
    });
    fixture = TestBed.createComponent(TestComponent);
    service = TestBed.get(CampaignActionService);
    router = TestBed.get(Router);
    store = TestBed.get(Store);

    const flightIds = [flightFixture.id, flightFixture.id + 1, flightFixture.id + 2, flightFixture.id + 3];
    const campaignDoc = new MockHalDoc(campaignDocFixture);
    const flightDocs = [
      new MockHalDoc({ ...flightDocFixture, id: flightIds[0] }),
      new MockHalDoc({ ...flightDocFixture, id: flightIds[1] }),
      new MockHalDoc({ ...flightDocFixture, id: flightIds[2] }),
      new MockHalDoc({ ...flightDocFixture, id: flightIds[3] })
    ];
    jest.spyOn(service, 'loadAvailability');
    fixture.ngZone.run(() => {
      const loadAction = new campaignActions.CampaignLoadSuccess({ campaignDoc, flightDocs });
      store.dispatch(loadAction);
      const goalAction = new campaignActions.CampaignFlightSetGoal({
        flightId: flightIds[0],
        totalGoal: 999,
        dailyMinimum: 9,
        valid: true
      });
      store.dispatch(goalAction);

      router
        .navigateByUrl(`/campaign/${campaignFixture.id}/flight/${flightFixture.id}`)
        .then(() => (dispatchSpy = jest.spyOn(store, 'dispatch')));
    });
  });

  it('should load availability from flight id change', () => {
    expect(service.loadAvailability).toHaveBeenCalledWith({ MOCKS: {}, ERRORS: {}, ...flightFixture });
  });

  it('should load availability and allocation preview when flight form is updated', () => {
    jest.spyOn(service, 'loadAvailabilityAllocationIfChanged');
    service.updateFlightForm({ ...flightFixture, endAt: new Date() }, true, true);
    expect(service.loadAvailabilityAllocationIfChanged).toHaveBeenCalled();
  });

  it('should dispatch action to load allocation preview', () => {
    const { id: flightId, name, startAt, totalGoal, set_inventory_uri, zones } = flightFixture;
    const endAt = new Date();
    const createdAt = new Date();
    const dailyMinimum = 100;

    const formFlight = { ...flightFixture, endAt };
    const localFlight = { ...flightFixture, createdAt };
    service.loadAvailabilityAllocationIfChanged(formFlight, localFlight, 100);

    expect(dispatchSpy).toHaveBeenCalledWith(
      new allocationPreviewActions.AllocationPreviewLoad({
        flightId,
        createdAt,
        set_inventory_uri,
        name,
        startAt,
        endAt,
        totalGoal,
        dailyMinimum,
        zones
      })
    );
  });

  it('should not load allocation preview if just the flight name changes', () => {
    const changedFlight = { ...flightFixture, name: 'new name' };
    service.loadAvailabilityAllocationIfChanged(changedFlight, flightFixture, 100);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch action to add a new flight', done => {
    service.addFlight();
    store.pipe(select(selectCampaignId)).subscribe(campaignId => {
      expect(dispatchSpy).toHaveBeenCalledWith(new campaignActions.CampaignAddFlight({ campaignId }));
      done();
    });
  });

  it('should dispatch action to duplicate flight', done => {
    service.dupFlight(flightFixture);
    store.pipe(select(selectCampaignId)).subscribe(campaignId => {
      expect(dispatchSpy).toHaveBeenCalledWith(new campaignActions.CampaignDupFlight({ campaignId, flight: flightFixture }));
      done();
    });
  });

  it('should dispatch action to toggle flight deletion', () => {
    service.deleteRoutedFlightToggle();
    expect(dispatchSpy).toHaveBeenCalledWith(new campaignActions.CampaignDeleteFlight({ id: flightFixture.id, softDeleted: true }));
  });

  it('should dispatch action to update flight form', () => {
    const flight = { ...flightFixture, name: 'new name' };
    service.updateFlightForm(flight, true, false);
    expect(dispatchSpy).toHaveBeenCalledWith(
      new campaignActions.CampaignFlightFormUpdate({
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
    expect(dispatchSpy).toHaveBeenCalledWith(new campaignActions.CampaignFlightSetGoal({ flightId, totalGoal, dailyMinimum, valid: true }));
  });

  it('should load allocation preview when total goal is changed', () => {
    const { id: flightId, createdAt, name, startAt, endAt, set_inventory_uri, zones, totalGoal } = flightFixture;
    const dailyMinimum = 10;
    service.setFlightGoal(flightId, totalGoal, dailyMinimum);
    expect(dispatchSpy).toHaveBeenLastCalledWith(
      new allocationPreviewActions.AllocationPreviewLoad({
        flightId,
        createdAt,
        set_inventory_uri,
        name,
        startAt,
        endAt,
        totalGoal,
        dailyMinimum,
        zones
      })
    );
  });

  it('should dispatch action to save campaign and flights', done => {
    service.saveCampaignAndFlights();
    store.pipe(select(selectCampaignWithFlightsForSave)).subscribe(campaignFlights => {
      expect(dispatchSpy).toHaveBeenCalledWith(new campaignActions.CampaignSave(campaignFlights));
      done();
    });
  });
});
