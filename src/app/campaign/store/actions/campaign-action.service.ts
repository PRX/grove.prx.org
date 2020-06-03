import { Injectable, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { filter, first, map, tap, withLatestFrom } from 'rxjs/operators';
import * as campaignActions from './campaign-action.creator';
import * as flightPreviewActions from './flight-preview-action.creator';
import { Flight, isZonesChanged, isStartAtChanged, isEndAtChanged, isInventoryChanged } from '../models';
import {
  selectCampaignId,
  selectCampaignWithFlightsForSave,
  selectRoutedFlight,
  selectCampaignDoc,
  selectCampaignAndFlights,
  selectRoutedCampaignFlightDocs
} from '../selectors';
import { Moment } from 'moment';

@Injectable()
export class CampaignActionService implements OnDestroy {
  // use a Subject to filter form updates through a pipe to dispatch form changes and load preview
  flightFormValueChanges = new Subject<{ flight: Flight; changed: boolean; valid: boolean }>();
  flightFormValueChangesSubscription: Subscription;
  flightFormValueChangesStream = this.flightFormValueChanges.pipe(
    // map form field values to a proper Flight
    map(({ flight, changed, valid }) => {
      return {
        flight: {
          ...flight,
          uncapped: flight.uncapped || false,
          totalGoal: flight.uncapped ? 0 : +flight.totalGoal,
          dailyMinimum: flight.uncapped ? 0 : +flight.dailyMinimum
        },
        changed,
        valid
      };
    }),
    // if preview params changed, dispatch loadFlightPreview
    withLatestFrom(this.store.pipe(select(selectRoutedFlight))),
    tap(([formState, flightState]) => {
      if (
        this.hasPreviewParams(formState.flight) &&
        this.isDateRangeValid(formState.flight) &&
        this.havePreviewParamsChanged(flightState.localFlight, formState.flight)
      ) {
        this.loadFlightPreview(formState.flight);
      }
    }),
    // guard flight form updates
    filter(([formState, flightState]) => this.hasChanged(formState.flight, flightState.localFlight))
  );

  constructor(private store: Store<any>) {
    this.updateFlightFormOnValueChanges();
  }

  ngOnDestroy() {
    if (this.flightFormValueChangesSubscription) {
      this.flightFormValueChangesSubscription.unsubscribe();
    }
  }

  loadFlightPreview(flight: Flight) {
    this.store.pipe(select(selectRoutedCampaignFlightDocs), first()).subscribe(({ campaignDoc, flightDoc }) => {
      this.store.dispatch(new flightPreviewActions.FlightPreviewCreate({ flight, flightDoc, campaignDoc }));
    });
  }

  isDateRangeValid({ startAt, endAt }: { startAt: Moment; endAt: Moment }) {
    return startAt && endAt && startAt.valueOf() < endAt.valueOf();
  }

  hasChanged(a: any, b: any) {
    if (a instanceof Array && b instanceof Array) {
      // arrays - compare each item if same length
      return a.length !== b.length || a.some((val, idx) => this.hasChanged(val, b[idx]));
    } else if (a instanceof Object && b instanceof Object) {
      // objects - compare keys in A to B (ignoring keys missing from A)
      return Object.keys(a).some(key => this.hasChanged(a[key], b[key]));
    } else if ((a === undefined || a === null) && (b === undefined || b === null)) {
      // nulls and undefined equate to the same thing
      return false;
    } else {
      // anything else - strict comparison
      return a !== b;
    }
  }

  hasPreviewParams(flight: Flight): boolean {
    return (
      flight &&
      flight.startAt &&
      flight.endAt &&
      flight.set_inventory_uri &&
      flight.zones &&
      flight.zones.filter(zone => zone.id).length > 0
    );
  }

  havePreviewParamsChanged(a: Flight, b: Flight) {
    return (
      isStartAtChanged(a, b) ||
      isEndAtChanged(a, b) ||
      isInventoryChanged(a, b) ||
      isZonesChanged(a, b) ||
      a.totalGoal !== b.totalGoal ||
      a.dailyMinimum !== b.dailyMinimum ||
      // coerce to boolean comparison in case undefined
      !!a.uncapped !== !!b.uncapped
    );
  }

  addFlight() {
    this.store.pipe(select(selectCampaignId), first()).subscribe(campaignId => {
      this.store.dispatch(new campaignActions.CampaignAddFlight({ campaignId }));
    });
  }

  dupFlight(flight: Flight) {
    this.store.pipe(select(selectCampaignId), first()).subscribe(campaignId => {
      this.store.dispatch(new campaignActions.CampaignDupFlight({ campaignId, flight }));
    });
  }

  deleteRoutedFlightToggle() {
    this.store
      .pipe(
        select(selectRoutedFlight),
        filter(state => !!(state && state.localFlight)),
        first()
      )
      .subscribe(state =>
        this.store.dispatch(new campaignActions.CampaignDeleteFlight({ id: state.localFlight.id, softDeleted: !state.softDeleted }))
      );
  }

  updateFlightForm(formFlight: Flight, changed: boolean, valid: boolean) {
    this.flightFormValueChanges.next({ flight: formFlight, changed, valid });
  }

  updateFlightFormOnValueChanges() {
    this.flightFormValueChangesSubscription = this.flightFormValueChangesStream.subscribe(([formState]) => {
      const { flight, changed, valid } = formState;
      this.store.dispatch(
        new campaignActions.CampaignFlightFormUpdate({
          flight,
          changed,
          valid
        })
      );
    });
  }

  saveCampaignAndFlights() {
    this.store
      .pipe(select(selectCampaignWithFlightsForSave), first())
      .subscribe(({ campaign, campaignDoc, updatedFlights, createdFlights, deletedFlights, tempDeletedFlights }) => {
        this.store.dispatch(
          new campaignActions.CampaignSave({ campaign, campaignDoc, updatedFlights, createdFlights, deletedFlights, tempDeletedFlights })
        );
      });
  }

  deleteCampaign() {
    this.store
      .pipe(select(selectCampaignDoc), first())
      .subscribe(campaignDoc => this.store.dispatch(new campaignActions.CampaignDelete(campaignDoc)));
  }

  duplicateCampaign() {
    this.store
      .pipe(select(selectCampaignAndFlights), first())
      .subscribe(payload => this.store.dispatch(new campaignActions.CampaignDuplicate(payload)));
  }
}
