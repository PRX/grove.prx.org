import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store, select } from '@ngrx/store';
import { reducers } from '../';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { CustomRouterSerializer } from '../../../store/router-store/custom-router-serializer';
import * as campaignActions from './campaign-action.creator';
import * as flightPreviewActions from './flight-preview-action.creator';
import { selectCampaignId, selectCampaignWithFlightsForSave } from '../selectors';
import {
  campaignFixture,
  campaignDocFixture,
  flightFixture,
  flightDocFixture,
  flightDaysDocFixture
} from '../models/campaign-state.factory';
import { MockHalDoc } from 'ngx-prx-styleguide';
import { TestComponent, campaignRoutes } from '../../../../testing/test.component';
import { CampaignActionService } from './campaign-action.service';
import * as moment from 'moment';

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
    const flightDaysDocs = {
      [flightIds[0]]: flightDaysDocFixture,
      [flightIds[1]]: flightDaysDocFixture,
      [flightIds[2]]: flightDaysDocFixture,
      [flightIds[3]]: flightDaysDocFixture
    };
    jest.spyOn(service, 'loadFlightPreview');

    fixture.ngZone.run(() => {
      router.navigateByUrl(`/campaign/${campaignFixture.id}/flight/${flightFixture.id}`).then(() => {
        const loadAction = new campaignActions.CampaignLoadSuccess({
          campaignDoc,
          flightDocs,
          flightDaysDocs
        });
        store.dispatch(loadAction);
        dispatchSpy = jest.spyOn(store, 'dispatch');
      });
    });
  });

  it('should load flight preview when flight form is updated', () => {
    jest.spyOn(service, 'loadPreviewIfFlightFormChanged');
    service.updateFlightForm({ ...flightFixture, endAt: moment.utc() }, true, true);
    expect(service.loadPreviewIfFlightFormChanged).toHaveBeenCalled();
  });

  it('should dispatch action to load flight preview', () => {
    const endAt = moment.utc();
    const formFlight = { ...flightFixture, endAt };
    const localFlight = flightFixture;
    service.loadPreviewIfFlightFormChanged(formFlight, localFlight);

    expect(JSON.stringify(dispatchSpy.mock.calls[dispatchSpy.mock.calls.length - 1][0])).toEqual(
      JSON.stringify(
        new flightPreviewActions.FlightPreviewCreate({
          flight: formFlight,
          flightDoc: new MockHalDoc(flightDocFixture),
          campaignDoc: new MockHalDoc(campaignDocFixture)
        })
      )
    );
  });

  describe('temporary flight id', () => {
    const flightId = Date.now();
    beforeEach(() => {
      global.Date.now = jest.fn(() => flightId);
    });

    it('should dispatch action to add a new flight', done => {
      service.addFlight();
      store.pipe(select(selectCampaignId)).subscribe(campaignId => {
        expect(dispatchSpy).toHaveBeenCalledWith(new campaignActions.CampaignAddFlight({ campaignId, flightId }));
        done();
      });
    });

    it('should dispatch action to duplicate flight', done => {
      service.dupFlight(flightFixture);
      store.pipe(select(selectCampaignId)).subscribe(campaignId => {
        expect(dispatchSpy).toHaveBeenCalledWith(new campaignActions.CampaignDupFlight({ campaignId, flight: flightFixture, flightId }));
        done();
      });
    });
  });

  it('should not load flight preview if just the flight name changes', () => {
    const changedFlight = { ...flightFixture, name: 'new name' };
    service.loadPreviewIfFlightFormChanged(changedFlight, flightFixture);
    expect(store.dispatch).not.toHaveBeenCalled();
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
    const totalGoal = 1000;
    const dailyMinimum = 10;
    const uncapped = false;
    service.setFlightGoal({ ...flightFixture, totalGoal, dailyMinimum, uncapped });
    expect(dispatchSpy).toHaveBeenCalledWith(
      new campaignActions.CampaignFlightSetGoal({ flightId: flightFixture.id, totalGoal, dailyMinimum, uncapped, valid: true })
    );
  });

  it('should load flight preview when total goal is changed', () => {
    service.setFlightGoal(flightFixture);
    expect(JSON.stringify(dispatchSpy.mock.calls[dispatchSpy.mock.calls.length - 1][0])).toEqual(
      JSON.stringify(
        new flightPreviewActions.FlightPreviewCreate({
          flight: flightFixture,
          flightDoc: new MockHalDoc(flightDocFixture),
          campaignDoc: new MockHalDoc(campaignDocFixture)
        })
      )
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
