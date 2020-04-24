import { Injectable, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import * as allocationPreviewActions from './allocation-preview-action.creator';
import * as availabilityActions from './availability-action.creator';
import * as campaignActions from './campaign-action.creator';
import { Flight, getFlightZoneIds, isZonesChanged, isStartAtChanged, isEndAtChanged, isInventoryChanged } from '../models';
import { selectCampaignId, selectCampaignWithFlightsForSave, selectRoutedFlight, selectRoutedLocalFlight } from '../selectors';
import { Moment } from 'moment';

@Injectable()
export class CampaignActionService implements OnDestroy {
  private flightSub: Subscription;
  // current flight id only to be used for checking against changed flight id to load availability on flight tab/route change
  // for any other current/routed flight id needs, please pipe from the selectRoutedFlightId selector
  // one reason the routed flight id selector is not used here is that is would fire on navigation before the flight is actually loaded
  private currentFlightId: number;

  constructor(private store: Store<any>) {
    this.loadAvailabilityOnFlightIdChange();
  }

  ngOnDestroy() {
    if (this.flightSub) {
      this.flightSub.unsubscribe();
    }
  }

  private loadAvailabilityOnFlightIdChange() {
    this.flightSub = this.store
      .pipe(select(selectRoutedLocalFlight))
      .pipe(filter(flight => flight && this.currentFlightId !== flight.id))
      .subscribe(flight => {
        if (this.hasAvailabilityParams(flight)) {
          this.loadAvailability(flight);
        }
        this.currentFlightId = flight.id;
      });
  }

  loadAvailabilityAllocationIfChanged(formFlight: Flight, localFlight: Flight) {
    if (this.isDateRangeValid(formFlight) && this.haveAvailabilityParamsChanged(formFlight, localFlight)) {
      this.loadAvailability({ ...formFlight, id: localFlight.id, createdAt: localFlight.createdAt });
      if (formFlight.totalGoal) {
        this.loadAllocationPreview({ ...formFlight, id: localFlight.id, createdAt: localFlight.createdAt });
      }
    }
  }

  isDateRangeValid({ startAt, endAt }: { startAt: Moment; endAt: Moment }) {
    return startAt && endAt && startAt.valueOf() < endAt.valueOf();
  }

  hasAvailabilityParams(flight: Flight): boolean {
    return flight && flight.startAt && flight.endAt && flight.set_inventory_uri && flight.zones && flight.zones.length > 0;
  }

  haveAvailabilityParamsChanged(a: Flight, b: Flight) {
    return (
      this.hasAvailabilityParams(a) && (isStartAtChanged(a, b) || isEndAtChanged(a, b) || isInventoryChanged(a, b) || isZonesChanged(a, b))
    );
  }

  loadAvailability(flight: Flight) {
    const { id: flightId, createdAt, set_inventory_uri, startAt, endAt, zones } = flight;
    const inventoryId = set_inventory_uri.split('/').pop();
    getFlightZoneIds(zones).forEach(zone => {
      this.store.dispatch(
        new availabilityActions.AvailabilityLoad({
          inventoryId,
          startDate: startAt.toDate(),
          endDate: endAt.toDate(),
          zone,
          createdAt,
          flightId
        })
      );
    });
  }

  loadAllocationPreview(flight: Flight) {
    const { id: flightId, createdAt, set_inventory_uri, name, startAt, endAt, zones, totalGoal, dailyMinimum } = flight;
    this.store.dispatch(
      new allocationPreviewActions.AllocationPreviewLoad({
        flightId,
        createdAt,
        set_inventory_uri,
        name,
        startAt: startAt.toDate(),
        endAt: endAt.toDate(),
        totalGoal,
        dailyMinimum,
        zones
      })
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
    this.store
      .pipe(
        select(selectRoutedFlight),
        filter(state => !!(state && state.localFlight)),
        first()
      )
      .subscribe(state => {
        this.loadAvailabilityAllocationIfChanged(formFlight, state.localFlight);
        this.store.dispatch(
          new campaignActions.CampaignFlightFormUpdate({
            flight: formFlight,
            changed,
            valid
          })
        );
      });
  }

  setFlightGoal(flight: Flight) {
    const { id, totalGoal, dailyMinimum } = flight;
    this.store.dispatch(new campaignActions.CampaignFlightSetGoal({ flightId: id, totalGoal, dailyMinimum, valid: !!totalGoal }));
    // if totalGoal, load allocation preview
    if (totalGoal) {
      this.loadAllocationPreview(flight);
    }
  }

  saveCampaignAndFlights() {
    this.store
      .pipe(select(selectCampaignWithFlightsForSave), first())
      .subscribe(({ campaign, campaignDoc, updatedFlights, createdFlights, deletedFlights, tempDeletedFlights }) =>
        this.store.dispatch(
          new campaignActions.CampaignSave({ campaign, campaignDoc, updatedFlights, createdFlights, deletedFlights, tempDeletedFlights })
        )
      );
  }
}
