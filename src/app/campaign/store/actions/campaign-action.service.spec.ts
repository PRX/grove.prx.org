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

    fixture.ngZone.run(() => {
      router.navigateByUrl(`/campaign/${campaignFixture.id}/flight/${flightFixture.id}`).then(() => {
        const loadAction = campaignActions.CampaignLoadSuccess({
          campaignDoc,
          flightDocs,
          flightDaysDocs
        });
        store.dispatch(loadAction);
        dispatchSpy = jest.spyOn(store, 'dispatch');
      });
    });
  });

  it('should pass flight form updates to Subject to be filtered and dispatched', () => {
    spyOn(service.flightFormValueChanges, 'next');
    const flight = { ...flightFixture, name: 'new name' };
    service.updateFlightForm(flight, true, false);
    expect(service.flightFormValueChanges.next).toHaveBeenCalledWith({
      flight,
      changed: true,
      valid: false
    });
  });

  describe('flight form update', () => {
    it('dispatches updates when the form changes', () => {
      const flight = { ...flightFixture, name: 'new name' };
      service.updateFlightForm(flight, true, true);
      expect(dispatchSpy).toHaveBeenCalledWith(campaignActions.CampaignFlightFormUpdate({ flight, changed: true, valid: true }));
    });

    it('does not dispatch non-changes', () => {
      const flight = { ...flightFixture };
      service.updateFlightForm(flight, true, true);
      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('hasChanged', () => {
    it('compares arrays', () => {
      expect(service.hasChanged([], [])).toEqual(false);
      expect(service.hasChanged(['one'], ['one'])).toEqual(false);
      expect(service.hasChanged(['one'], ['two'])).toEqual(true);
      expect(service.hasChanged(['one'], ['one', 'two'])).toEqual(true);
      expect(service.hasChanged(['one', 'two'], ['one'])).toEqual(true);
    });

    it('compares objects', () => {
      expect(service.hasChanged({}, {})).toEqual(false);
      expect(service.hasChanged({ one: 1 }, { one: 1 })).toEqual(false);
      expect(service.hasChanged({ one: 1 }, { one: 2 })).toEqual(true);
      expect(service.hasChanged({ one: 1 }, { two: 2 })).toEqual(true);
      expect(service.hasChanged({ one: 1 }, { one: 1, two: 2 })).toEqual(false);
      expect(service.hasChanged({ one: 1, two: 2 }, { one: 1 })).toEqual(true);
    });

    it('compares other stuff', () => {
      expect(service.hasChanged('a', 'a')).toEqual(false);
      expect(service.hasChanged('a', 'b')).toEqual(true);
      expect(service.hasChanged(1, 1)).toEqual(false);
      expect(service.hasChanged(1, '1')).toEqual(true);
      expect(service.hasChanged(null, null)).toEqual(false);
      expect(service.hasChanged(null, undefined)).toEqual(false);
      expect(service.hasChanged(undefined, undefined)).toEqual(false);
      expect(service.hasChanged(undefined, null)).toEqual(false);
      expect(service.hasChanged(null, false)).toEqual(true);
    });

    it('compares recursively', () => {
      expect(service.hasChanged({ a: [{ one: 'one' }] }, { a: [{ one: 'one', two: 'two' }] })).toEqual(false);
      expect(service.hasChanged({ a: [{ one: 'one' }, { two: 'two' }] }, { a: [{ one: 'one' }, { two: 'three' }] })).toEqual(true);
    });
  });

  describe('flight preview', () => {
    beforeEach(() => {
      jest.spyOn(service, 'loadFlightPreview');
    });

    it('should load flight preview when flight form is updated', () => {
      service.updateFlightForm({ ...flightFixture, totalGoal: 10 }, true, true);
      expect(service.loadFlightPreview).toHaveBeenCalled();
    });

    it('should not load flight preview if just the name is changed', () => {
      service.updateFlightForm({ ...flightFixture, name: 'new name' }, true, true);
      expect(service.loadFlightPreview).not.toHaveBeenCalled();
    });

    it('should load flight preview when total goal is changed', () => {
      service.updateFlightForm({ ...flightFixture, endAt: moment.utc() }, true, true);
      expect(service.loadFlightPreview).toHaveBeenCalled();
    });

    it('sets the goals to 0 for uncapped flights', () => {
      service.updateFlightForm({ ...flightFixture, uncapped: true }, true, true);
      expect(service.loadFlightPreview).toHaveBeenCalledWith({ ...flightFixture, uncapped: true, totalGoal: 0, dailyMinimum: 0 });
    });

    it('should dispatch action to load flight preview', () => {
      service.loadFlightPreview(flightFixture);
      expect(JSON.stringify(dispatchSpy.mock.calls[dispatchSpy.mock.calls.length - 1][0])).toEqual(
        JSON.stringify(
          flightPreviewActions.FlightPreviewCreate({
            flight: flightFixture,
            flightDoc: new MockHalDoc(flightDocFixture),
            campaignDoc: new MockHalDoc(campaignDocFixture)
          })
        )
      );
    });
  });

  describe('temporary flight id', () => {
    const flightId = Date.now();
    beforeEach(() => {
      global.Date.now = jest.fn(() => flightId);
    });

    it('should dispatch action to add a new flight', done => {
      service.addFlight();
      store.pipe(select(selectCampaignId)).subscribe(campaignId => {
        expect(dispatchSpy).toHaveBeenCalledWith(campaignActions.CampaignAddFlight({ campaignId, flightId }));
        done();
      });
    });

    it('should dispatch action to duplicate flight', done => {
      service.dupFlight(flightFixture);
      store.pipe(select(selectCampaignId)).subscribe(campaignId => {
        expect(dispatchSpy).toHaveBeenCalledWith(campaignActions.CampaignDupFlight({ campaignId, flight: flightFixture, flightId }));
        done();
      });
    });
  });

  it('should dispatch action to toggle flight deletion', () => {
    service.deleteRoutedFlightToggle();
    expect(dispatchSpy).toHaveBeenCalledWith(campaignActions.CampaignDeleteFlight({ id: flightFixture.id, softDeleted: true }));
  });

  it('should dispatch action to save campaign and flights', done => {
    service.saveCampaignAndFlights();
    store.pipe(select(selectCampaignWithFlightsForSave)).subscribe(campaignFlights => {
      expect(dispatchSpy).toHaveBeenCalledWith(campaignActions.CampaignSave(campaignFlights));
      done();
    });
  });
});
