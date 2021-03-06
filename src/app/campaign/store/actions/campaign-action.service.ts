import { Injectable, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { filter, first, map, tap, withLatestFrom, debounceTime } from 'rxjs/operators';
import { utc } from 'moment';
import * as campaignActions from './campaign-action.creator';
import * as flightPreviewActions from './flight-preview-action.creator';
import { Flight, FlightZone, FlightTarget } from '../models';
import {
  selectCampaignId,
  selectCampaignWithFlightsForSave,
  selectRoutedFlight,
  selectCampaignDoc,
  selectCampaignAndFlights,
  selectRoutedCampaignFlightDocs
} from '../selectors';
import { Moment, isMoment } from 'moment';

interface FlightFormState {
  flight: Flight;
  changed: boolean;
  valid: boolean;
}

@Injectable()
export class CampaignActionService implements OnDestroy {
  // use a Subject to filter form updates through a pipe to dispatch form changes and load preview
  flightFormValueChanges = new Subject<FlightFormState>();
  flightFormValueChangesSubscription: Subscription;
  flightFormValueChangesStream = this.flightFormValueChanges.pipe(
    map(this.transformFlightForm),
    // if preview params changed, dispatch loadFlightPreview
    withLatestFrom(this.store.pipe(select(selectRoutedFlight))),
    // re-using the flight form, so check that ids match
    filter(([formState, flightState]) => !flightState || !flightState.localFlight || formState.flight.id === flightState.localFlight.id),
    // debounce so numeric fields aren't constantly firing previews
    debounceTime(500),
    tap(([formState, flightState]) => {
      if (
        this.hasPreviewParams(formState.flight) &&
        this.isDateRangeValid(formState.flight) &&
        this.havePreviewParamsChanged(flightState.localFlight, formState.flight) &&
        this.allFlightTargetsHaveCode(formState.flight)
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

  transformFlightForm({ flight, changed, valid }: FlightFormState): FlightFormState {
    return {
      flight: {
        ...flight,
        // set goal fields based on delivery mode
        ...(flight.deliveryMode === 'uncapped' && { dailyMinimum: null }),
        ...(flight.deliveryMode === 'greedy_uncapped' && { contractGoal: null, dailyMinimum: null }),
        // augury doesn't like null targets
        targets: flight.targets || [],
        // set the endAt from any form changes to endAtFudged
        ...(flight.endAtFudged && { endAt: utc(flight.endAtFudged.valueOf()).add(1, 'days') }),
        ...(flight.contractEndAtFudged && { contractEndAt: utc(flight.contractEndAtFudged.valueOf()).add(1, 'days') })
      },
      changed,
      valid
    };
  }

  loadFlightPreview(flight: Flight) {
    this.store.pipe(select(selectRoutedCampaignFlightDocs), first()).subscribe(({ campaignDoc, flightDoc }) => {
      this.store.dispatch(flightPreviewActions.FlightPreviewCreate({ flight, flightDoc, campaignDoc }));
    });
  }

  isDateRangeValid({ startAt, endAt }: { startAt: Moment; endAt: Moment }) {
    return startAt && endAt && startAt.valueOf() < endAt.valueOf();
  }

  hasChanged(a: any, b: any) {
    if (a instanceof Array && b instanceof Array) {
      // arrays - compare each item if same length
      return a.length !== b.length || a.some((val, idx) => this.hasChanged(val, b[idx]));
    } else if (a instanceof Array || b instanceof Array) {
      // array vs non-array - only equal if "empty"
      return !(
        (a === undefined || a === null || a === '' || a.length === 0) &&
        (b === undefined || b === null || b === '' || b.length === 0)
      );
    } else if (isMoment(a) && isMoment(b)) {
      return a.valueOf() !== b.valueOf();
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

  haveZoneIdsChanged(a: FlightZone[], b: FlightZone[]) {
    return (
      a
        .map(z => z.id)
        .sort((z1, z2) => z1.localeCompare(z2))
        .join(',') !==
      b
        .map(z => z.id)
        .sort((z1, z2) => z1.localeCompare(z2))
        .join(',')
    );
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
    const check = [
      'startAt',
      'endAt',
      'set_inventory_uri',
      'targets',
      'allocationPriority',
      'totalGoal',
      'dailyMinimum',
      'deliveryMode',
      'isCompanion'
    ];
    return (
      this.haveZoneIdsChanged(a.zones, b.zones) ||
      check.some(fld => {
        if (this.hasChanged(b[fld], a[fld])) {
          return true;
        }
      })
    );
  }

  allFlightTargetsHaveCode({ targets }: Flight) {
    return targets.reduce((a, { code }: FlightTarget) => a && !!code, true);
  }

  addFlight() {
    this.store.pipe(select(selectCampaignId), first()).subscribe(campaignId => {
      this.store.dispatch(campaignActions.CampaignAddFlight({ campaignId }));
    });
  }

  dupFlight(flight: Flight) {
    this.store.pipe(select(selectCampaignId), first()).subscribe(campaignId => {
      this.store.dispatch(campaignActions.CampaignDupFlight({ campaignId, flight }));
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
        this.store.dispatch(campaignActions.CampaignDeleteFlight({ id: state.localFlight.id, softDeleted: !state.softDeleted }))
      );
  }

  updateFlightForm(formFlight: Flight, changed: boolean, valid: boolean) {
    this.flightFormValueChanges.next({ flight: formFlight, changed, valid });
  }

  updateFlightFormOnValueChanges() {
    this.flightFormValueChangesSubscription = this.flightFormValueChangesStream.subscribe(([formState]) => {
      const { flight, changed, valid } = formState;
      this.store.dispatch(
        campaignActions.CampaignFlightFormUpdate({
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
          campaignActions.CampaignSave({ campaign, campaignDoc, updatedFlights, createdFlights, deletedFlights, tempDeletedFlights })
        );
      });
  }

  deleteCampaign() {
    this.store.pipe(select(selectCampaignDoc), first()).subscribe(doc => this.store.dispatch(campaignActions.CampaignDelete({ doc })));
  }

  duplicateCampaign() {
    this.store
      .pipe(select(selectCampaignAndFlights), first())
      .subscribe(params => this.store.dispatch(campaignActions.CampaignDuplicate(params)));
  }
}
