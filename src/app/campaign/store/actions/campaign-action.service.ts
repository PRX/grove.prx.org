import { Injectable, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import * as allocationPreviewActions from './allocation-preview-action.creator';
import * as campaignActions from './campaign-action.creator';
import { Flight, FlightZone } from '../models';
import { selectCampaignId, selectCampaignWithFlightsForSave, selectRoutedFlight, selectRoutedLocalFlight } from '../selectors';
import { CampaignStoreService } from '../../../core';

@Injectable()
export class CampaignActionService implements OnDestroy {
  private flightSub: Subscription;
  private currentFlightId: number;

  constructor(private store: Store<any>, private campaignStoreService: CampaignStoreService) {
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
        this.campaignStoreService.loadAvailability(flight);
        this.currentFlightId = flight.id;
      });
  }

  loadAvailabilityAllocationIfChanged(formFlight: Flight, localFlight: Flight, dailyMinimum: number) {
    const { set_inventory_uri, name, startAt, endAt, zones, totalGoal } = formFlight;
    const dateRangeValid = startAt && endAt && startAt.valueOf() < endAt.valueOf();
    const hasAvailabilityParams = startAt && endAt && set_inventory_uri && zones && zones.length > 0;
    const availabilityParamsChanged =
      hasAvailabilityParams &&
      (startAt.getTime() !== localFlight.startAt.getTime() ||
        endAt.getTime() !== localFlight.endAt.getTime() ||
        set_inventory_uri !== localFlight.set_inventory_uri ||
        !zones.every(zone => localFlight.zones.indexOf(zone) > -1));
    if (dateRangeValid && availabilityParamsChanged) {
      this.campaignStoreService.loadAvailability(formFlight);
      if (formFlight.totalGoal) {
        this.store.dispatch(
          new allocationPreviewActions.AllocationPreviewLoad({
            flightId: localFlight.id,
            createdAt: localFlight.createdAt,
            set_inventory_uri,
            name,
            startAt,
            endAt,
            totalGoal,
            dailyMinimum,
            zones
          })
        );
      }
    }
  }

  addFlight() {
    this.store.pipe(select(selectCampaignId), first()).subscribe(campaignId => {
      this.store.dispatch(new campaignActions.CampaignAddFlight({ campaignId }));
    });
  }

  addZone(zone: FlightZone) {
    this.store
      .pipe(
        select(selectRoutedFlight),
        filter(state => !!(state && state.id)),
        first()
      )
      .subscribe(state => this.store.dispatch(new campaignActions.CampaignFlightAddZone({ flightId: state.id, zone: zone })));
  }

  removeZone(zone: FlightZone) {
    this.store
      .pipe(
        select(selectRoutedFlight),
        filter(state => !!(state && state.id)),
        first()
      )
      .subscribe(state => this.store.dispatch(new campaignActions.CampaignFlightRemoveZone({ flightId: state.id, zone: zone })));
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
              zones
            })
          );
        });
    }
  }

  saveCampaignAndFlights() {
    this.store
      .pipe(select(selectCampaignWithFlightsForSave), first())
      .subscribe(({ campaign, updatedFlights, createdFlights, deletedFlights }) =>
        this.store.dispatch(new campaignActions.CampaignSave({ campaign, updatedFlights, createdFlights, deletedFlights }))
      );
  }
}
