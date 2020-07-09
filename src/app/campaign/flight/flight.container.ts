import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Flight, InventoryRollup, Inventory, InventoryZone, InventoryTargets, FlightZone } from '../store/models';
import {
  selectRoutedLocalFlight,
  selectRoutedFlightDeleted,
  selectRoutedFlightChanged,
  selectCurrentInventoryUri,
  selectRoutedFlightPreviewError,
  selectFlightDaysRollup,
  selectIsFlightPreview,
  selectIsFlightPreviewLoading,
  selectAllInventoryOrderByName,
  selectCurrentInventoryZones,
  selectCurrentInventoryTargets,
  selectFlightActualsDateBoundaries
} from '../store/selectors';
import { CampaignActionService } from '../store/actions/campaign-action.service';

@Component({
  template: `
    <grove-flight
      [inventory]="inventoryOptions$ | async"
      [zoneOptions]="zoneOptions$ | async"
      [targetOptions]="targetOptions$ | async"
      [flight]="flightLocal$ | async"
      [softDeleted]="softDeleted$ | async"
      [rollup]="inventoryRollup$ | async"
      [isPreview]="isPreview$ | async"
      [isLoading]="isLoading$ | async"
      [previewError]="flightPreviewError$ | async"
      [flightActualsDateBoundaries]="flightActualsDateBoundaries$ | async"
      (flightUpdate)="flightUpdateFromForm($event)"
      (flightDeleteToggle)="flightDeleteToggle()"
      (flightDuplicate)="flightDuplicate($event)"
      (addZone)="addZone($event)"
      (removeZone)="removeZone($event)"
    ></grove-flight>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightContainerComponent implements OnInit, OnDestroy {
  flightLocal$: Observable<Flight>;
  softDeleted$: Observable<boolean>;
  flightChanged$: Observable<boolean>;
  inventoryRollup$: Observable<InventoryRollup>;
  isPreview$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  currentInventoryUri$: Observable<string>;
  flightPreviewError$: Observable<any>;
  inventoryOptions$: Observable<Inventory[]>;
  zoneOptions$: Observable<InventoryZone[]>;
  targetOptions$: Observable<InventoryTargets>;
  flightActualsDateBoundaries$: Observable<{ startAt: Date; endAt: Date }>;
  flightSub: Subscription;

  constructor(private store: Store<any>, private campaignAction: CampaignActionService) {}

  ngOnInit() {
    this.flightLocal$ = this.store.pipe(select(selectRoutedLocalFlight));
    this.softDeleted$ = this.store.pipe(select(selectRoutedFlightDeleted));
    this.flightChanged$ = this.store.pipe(select(selectRoutedFlightChanged));
    this.currentInventoryUri$ = this.store.pipe(select(selectCurrentInventoryUri));
    this.flightPreviewError$ = this.store.pipe(select(selectRoutedFlightPreviewError));
    this.inventoryRollup$ = this.store.pipe(select(selectFlightDaysRollup));
    this.isPreview$ = this.store.pipe(select(selectIsFlightPreview));
    this.isLoading$ = this.store.pipe(select(selectIsFlightPreviewLoading));
    this.inventoryOptions$ = this.store.pipe(select(selectAllInventoryOrderByName));
    this.zoneOptions$ = this.store.pipe(select(selectCurrentInventoryZones));
    this.targetOptions$ = this.store.pipe(select(selectCurrentInventoryTargets));
    this.flightActualsDateBoundaries$ = this.store.pipe(select(selectFlightActualsDateBoundaries));
  }

  ngOnDestroy() {
    if (this.flightSub) {
      this.flightSub.unsubscribe();
    }
  }

  flightUpdateFromForm({ flight: formFlight, changed, valid }: { flight: Flight; changed: boolean; valid: boolean }) {
    this.campaignAction.updateFlightForm(formFlight, changed, valid);
  }

  flightDuplicate(flight: Flight) {
    this.campaignAction.dupFlight(flight);
  }

  flightDeleteToggle() {
    this.campaignAction.deleteRoutedFlightToggle();
  }

  addZone({ flightId, zone }: { flightId: number; zone: FlightZone }) {
    this.campaignAction.addFlightZone({ flightId, zone });
  }

  removeZone({ flightId, index }: { flightId: number; index: number }) {
    this.campaignAction.removeFlightZone({ flightId, index });
  }
}
