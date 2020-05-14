import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { first, filter } from 'rxjs/operators';
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
export class CampaignActionService {
  constructor(private store: Store<any>) {}

  loadPreviewIfFlightFormChanged(formFlight: Flight, localFlight: Flight) {
    if (this.isDateRangeValid(formFlight) && this.havePreviewParamsChanged(formFlight, localFlight)) {
      this.loadFlightPreview({ ...formFlight, id: localFlight.id });
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
    return this.hasPreviewParams(a) && (isStartAtChanged(a, b) || isEndAtChanged(a, b) || isInventoryChanged(a, b) || isZonesChanged(a, b));
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
        filter(state => {
          return !!(state && state.localFlight);
        }),
        first()
      )
      .subscribe(state => {
        this.loadPreviewIfFlightFormChanged(formFlight, state.localFlight);
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
    const { id, totalGoal, dailyMinimum, uncapped } = flight;
    const valid = totalGoal >= 0 && dailyMinimum >= 0;
    this.store.dispatch(new campaignActions.CampaignFlightSetGoal({ flightId: id, totalGoal, dailyMinimum, uncapped, valid }));
    this.loadFlightPreview(flight);
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
