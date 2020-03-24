import { Injectable, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { first, filter } from 'rxjs/operators';
import * as allocationPreviewActions from './allocation-preview-action.creator';
import * as campaignActions from './campaign-action.creator';
import { Campaign, Flight } from '../models';
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

  private loadAvailabilityAllocationIfChanged(formFlight: Flight, localFlight: Flight, dailyMinimum: number) {
    const dateRangeValid = formFlight.startAt && formFlight.endAt && formFlight.startAt.valueOf() < formFlight.endAt.valueOf();
    const hasAvailabilityParams =
      formFlight.startAt && formFlight.endAt && formFlight.set_inventory_uri && formFlight.zones && formFlight.zones.length > 0;
    const availabilityParamsChanged =
      hasAvailabilityParams &&
      (formFlight.startAt.getTime() !== localFlight.startAt.getTime() ||
        formFlight.endAt.getTime() !== localFlight.endAt.getTime() ||
        formFlight.set_inventory_uri !== localFlight.set_inventory_uri ||
        !formFlight.zones.every(zone => localFlight.zones.indexOf(zone) > -1));
    if (dateRangeValid && availabilityParamsChanged) {
      this.campaignStoreService.loadAvailability(formFlight);
      if (formFlight.totalGoal) {
        this.loadAllocationPreview(
          formFlight.id,
          formFlight.set_inventory_uri,
          formFlight.name,
          formFlight.startAt,
          formFlight.endAt,
          formFlight.totalGoal,
          dailyMinimum,
          formFlight.zones
        );
      }
    }
  }

  loadCampaignOptions() {
    this.store.dispatch(new campaignActions.CampaignLoadOptions());
  }

  newCampaign() {
    this.store.dispatch(new campaignActions.CampaignNew());
  }

  loadCampaign(id: number) {
    this.store.dispatch(new campaignActions.CampaignLoad({ id }));
  }

  loadAllocationPreview(
    flightId: number,
    // tslint:disable-next-line: variable-name
    set_inventory_uri: string,
    name: string,
    startAt: Date,
    endAt: Date,
    totalGoal: number,
    dailyMinimum: number,
    zones: string[]
  ) {
    this.store.dispatch(
      new allocationPreviewActions.AllocationPreviewLoad({
        flightId,
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

  updateCampaignForm(campaign: Campaign, changed: boolean, valid: boolean) {
    this.store.dispatch(new campaignActions.CampaignFormUpdate({ campaign, changed, valid }));
  }

  // tslint:disable-next-line: variable-name
  setCampaignAdvertiser(set_advertiser_uri: string) {
    this.store.dispatch(new campaignActions.CampaignSetAdvertiser({ set_advertiser_uri }));
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
    if (totalGoal) {
      this.store
        .pipe(
          select(selectRoutedLocalFlight),
          filter(state => !!state),
          first()
        )
        .subscribe(flight => {
          this.loadAllocationPreview(
            flight.createdAt && flightId,
            flight.set_inventory_uri,
            flight.name,
            flight.startAt,
            flight.endAt,
            flight.totalGoal,
            dailyMinimum,
            flight.zones
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
