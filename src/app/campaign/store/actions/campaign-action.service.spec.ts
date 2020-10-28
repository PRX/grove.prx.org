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
import moment from 'moment';

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
      providers: [CampaignActionService]
    });
    fixture = TestBed.createComponent(TestComponent);
    service = TestBed.inject(CampaignActionService);
    router = TestBed.inject(Router);
    store = TestBed.inject(Store);

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
    beforeEach(() => jest.useFakeTimers());

    it('dispatches updates when the form changes', () => {
      const flight = { ...flightFixture, name: 'new name' };
      service.updateFlightForm(flight, true, true);
      jest.runAllTimers();
      expect(dispatchSpy).toHaveBeenCalledWith(campaignActions.CampaignFlightFormUpdate({ flight, changed: true, valid: true }));
    });

    it('does not dispatch non-changes', () => {
      const flight = { ...flightFixture };
      service.updateFlightForm(flight, true, true);
      jest.runAllTimers();
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('transforms fields for uncapped flights', () => {
      const flight = { ...flightFixture, deliveryMode: 'uncapped', dailyMinimum: 123 };
      service.updateFlightForm(flight, true, true);
      jest.runAllTimers();
      expect(dispatchSpy).toHaveBeenCalledWith(
        campaignActions.CampaignFlightFormUpdate({ flight: { ...flight, dailyMinimum: null }, changed: true, valid: true })
      );
    });

    it('sets endAt from flight form endAtFudged', () => {
      const today = moment
        .utc()
        .hours(0)
        .minutes(0)
        .seconds(0)
        .milliseconds(0);
      const yesterday = moment.utc(today.valueOf()).subtract(1, 'days');
      service.updateFlightForm({ ...flightFixture, endAtFudged: yesterday, contractEndAtFudged: yesterday }, true, true);
      jest.runAllTimers();
      expect(dispatchSpy.mock.calls[dispatchSpy.mock.calls.length - 1][0]).toMatchObject(
        campaignActions.CampaignFlightFormUpdate({
          flight: { ...flightFixture, endAt: today, endAtFudged: yesterday, contractEndAtFudged: yesterday, contractEndAt: today },
          changed: true,
          valid: true
        })
      );
    });

    it('transforms fields for greedy flights', () => {
      const flight = { ...flightFixture, deliveryMode: 'greedy_uncapped', contractGoal: 123, dailyMinimum: 456 };
      service.updateFlightForm(flight, true, true);
      jest.runAllTimers();
      expect(dispatchSpy).toHaveBeenCalledWith(
        campaignActions.CampaignFlightFormUpdate({
          flight: { ...flight, contractGoal: null, dailyMinimum: null },
          changed: true,
          valid: true
        })
      );
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

    it('compares mismatched arrays', () => {
      expect(service.hasChanged([], null)).toEqual(false);
      expect(service.hasChanged([], undefined)).toEqual(false);
      expect(service.hasChanged([], '')).toEqual(false);
      expect(service.hasChanged(null, [])).toEqual(false);
      expect(service.hasChanged([], false)).toEqual(true);
      expect(service.hasChanged(['one'], null)).toEqual(true);
    });

    it('compares objects', () => {
      expect(service.hasChanged({}, {})).toEqual(false);
      expect(service.hasChanged({ one: 1 }, { one: 1 })).toEqual(false);
      expect(service.hasChanged({ one: 1 }, { one: 2 })).toEqual(true);
      expect(service.hasChanged({ one: 1 }, { two: 2 })).toEqual(true);
      expect(service.hasChanged({ one: 1 }, { one: 1, two: 2 })).toEqual(false);
      expect(service.hasChanged({ one: 1, two: 2 }, { one: 1 })).toEqual(true);
    });

    it('compares moments', () => {
      const date1 = moment.utc();
      const date2 = moment(date1.valueOf());
      expect(service.hasChanged(date1, date2)).toEqual(false);
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
      jest.useFakeTimers();
      jest.spyOn(service, 'loadFlightPreview');
    });

    it('should load flight preview when flight form is updated', () => {
      service.updateFlightForm({ ...flightFixture, totalGoal: 10 }, true, true);
      jest.runAllTimers();
      expect(service.loadFlightPreview).toHaveBeenCalled();
    });

    it('should not load flight preview if just the name is changed', () => {
      service.updateFlightForm({ ...flightFixture, name: 'new name' }, true, true);
      jest.runAllTimers();
      expect(service.loadFlightPreview).not.toHaveBeenCalled();
    });

    it('should load flight preview when total goal is changed', () => {
      service.updateFlightForm({ ...flightFixture, endAt: moment.utc() }, true, true);
      jest.runAllTimers();
      expect(service.loadFlightPreview).toHaveBeenCalled();
    });

    it('should not load flight preview if routed flight id is different from form flight id (route transition)', () => {
      service.updateFlightForm({ ...flightFixture, id: 1234, totalGoal: 10 }, true, true);
      jest.runAllTimers();
      expect(service.loadFlightPreview).not.toHaveBeenCalled();
    });

    it('should load flight preview when delivery mode is changed', () => {
      service.updateFlightForm({ ...flightFixture, deliveryMode: 'uncapped' }, true, true);
      jest.runAllTimers();
      expect(service.loadFlightPreview).toHaveBeenCalled();
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
