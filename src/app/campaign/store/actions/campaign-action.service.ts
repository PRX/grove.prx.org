import { Injectable, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import * as allocationPreviewActions from './allocation-preview-action.creator';
import * as availabilityActions from './availability-action.creator';
import * as campaignActions from './campaign-action.creator';
import { Flight } from '../models';
import { selectCampaignId, selectCampaignWithFlightsForSave, selectRoutedFlight, selectRoutedLocalFlight } from '../selectors';

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

  private getZoneIds(zones: any[]): string[] {
    return zones.map(z => (z ? z.id || z : z)).filter(z => z);
  }

  loadAvailabilityAllocationIfChanged(formFlight: Flight, localFlight: Flight, dailyMinimum: number) {
    if (this.isDateRangeValid(formFlight) && this.haveAvailabilityParamsChanged(formFlight, localFlight)) {
      this.loadAvailability({ ...formFlight, id: localFlight.id, createdAt: localFlight.createdAt });
      if (formFlight.totalGoal) {
        this.loadAllocationPreview({ ...formFlight, id: localFlight.id, createdAt: localFlight.createdAt }, dailyMinimum);
      }
    }
  }

  isDateRangeValid({ startAt, endAt }: { startAt: Date; endAt: Date }) {
    return startAt && endAt && startAt.valueOf() < endAt.valueOf();
  }

  hasAvailabilityParams(flight: Flight): boolean {
    return flight && flight.startAt && flight.endAt && flight.set_inventory_uri && flight.zones && flight.zones.length > 0;
  }

  haveAvailabilityParamsChanged(a: Flight, b: Flight) {
    return (
      this.hasAvailabilityParams(a) &&
      (!this.hasAvailabilityParams(b) ||
        a.startAt.getTime() !== b.startAt.getTime() ||
        a.endAt.getTime() !== b.endAt.getTime() ||
        a.set_inventory_uri !== b.set_inventory_uri ||
        this.haveFlightZonesChanged(a, b))
    );
  }

  haveFlightZonesChanged(a: Flight, b: Flight) {
    const aZones = this.getZoneIds(a.zones)
      .sort()
      .join(',');
    const bZones = this.getZoneIds(b.zones)
      .sort()
      .join(',');
    return aZones !== bZones;
  }

  loadAvailability(flight: Flight) {
    const { id: flightId, createdAt, set_inventory_uri, startAt: startDate, endAt: endDate, zones } = flight;
    const inventoryId = set_inventory_uri.split('/').pop();
    this.getZoneIds(zones).forEach(zone => {
      this.store.dispatch(new availabilityActions.AvailabilityLoad({ inventoryId, startDate, endDate, zone, createdAt, flightId }));
    });
  }

  loadAllocationPreview(flight: Flight, dailyMinimum: number) {
    const { id: flightId, createdAt, set_inventory_uri, name, startAt, endAt, zones, totalGoal } = flight;
    this.store.dispatch(
      new allocationPreviewActions.AllocationPreviewLoad({
        flightId,
        createdAt,
        set_inventory_uri,
        name,
        startAt,
        endAt,
        totalGoal,
        dailyMinimum,
        zones: this.getZoneIds(zones)
      })
    );
  }

  addFlight() {
    this.store
      .pipe(
        select(selectCampaignId),
        first()
      )
      .subscribe(campaignId => {
        this.store.dispatch(new campaignActions.CampaignAddFlight({ campaignId }));
      });
  }

  dupFlight(flight: Flight) {
    this.store
      .pipe(
        select(selectCampaignId),
        first()
      )
      .subscribe(campaignId => {
        this.store.dispatch(new campaignActions.CampaignDupFlight({ campaignId, flight }));
      });
  }

  deleteRoutedFlightToggle() {
    this.store
      .pipe(
        select(selectRoutedFlight),
        filter(state => !!(state && state.id)),
        first()
      )
      .subscribe(state => this.store.dispatch(new campaignActions.CampaignDeleteFlight({ id: state.id, softDeleted: !state.softDeleted })));
  }

  updateFlightForm(formFlight: Flight, changed: boolean, valid: boolean) {
    this.store
      .pipe(
        select(selectRoutedFlight),
        filter(state => !!(state && state.id)),
        first()
      )
      .subscribe(state => {
        this.loadAvailabilityAllocationIfChanged(formFlight, state.localFlight, state.dailyMinimum);
        this.store.dispatch(
          new campaignActions.CampaignFlightFormUpdate({
            flight: formFlight,
            changed,
            valid
          })
        );
      });
  }

  setFlightGoal(flightId: number, totalGoal: number, dailyMinimum: number) {
    this.store.dispatch(new campaignActions.CampaignFlightSetGoal({ flightId, totalGoal, dailyMinimum, valid: !!totalGoal }));
    // if totalGoal, get flight info to load allocation preview
    if (totalGoal) {
      this.store
        .pipe(
          select(selectRoutedLocalFlight),
          filter(state => !!state),
          first()
        )
        .subscribe(flight => {
          const { createdAt, set_inventory_uri, name, startAt, endAt, zones } = flight;
          this.store.dispatch(
            new allocationPreviewActions.AllocationPreviewLoad({
              flightId,
              createdAt,
              set_inventory_uri,
              name,
              startAt,
              endAt,
              totalGoal,
              dailyMinimum,
              zones: this.getZoneIds(zones)
            })
          );
        });
    }
  }

  saveCampaignAndFlights() {
    this.store
      .pipe(
        select(selectCampaignWithFlightsForSave),
        first()
      )
      .subscribe(({ campaign, updatedFlights, createdFlights, deletedFlights }) =>
        this.store.dispatch(new campaignActions.CampaignSave({ campaign, updatedFlights, createdFlights, deletedFlights }))
      );
  }
}
