import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { filter, withLatestFrom } from 'rxjs/operators';
import { MatDrawer } from '@angular/material/sidenav';
import { Flight, InventoryRollup, Inventory, InventoryZone, InventoryTargetType, InventoryTargetsMap } from '../store/models';
import {
  selectRoutedLocalFlight,
  selectRoutedFlightDeleted,
  selectRoutedFlightChanged,
  selectCurrentInventoryUri,
  selectRoutedFlightPreviewError,
  selectRoutedCreativeId,
  selectFlightDaysRollup,
  selectIsFlightPreview,
  selectIsFlightPreviewLoading,
  selectAllInventoryOrderByName,
  selectCurrentInventoryZones,
  selectCurrentInventoryTargetTypes,
  selectCurrentInventoryTargetsTypeMap,
  selectFlightActualsDateBoundaries,
  selectCampaignId,
  selectShowCreativeListRoute
} from '../store/selectors';
import { CampaignActionService } from '../store/actions/campaign-action.service';

@Component({
  template: `
    <mat-drawer-container hasBackdrop="true">
      <mat-drawer mode="over" position="end" #creative><router-outlet></router-outlet></mat-drawer>
      <mat-drawer-content>
        <grove-flight
          [inventory]="inventoryOptions$ | async"
          [zoneOptions]="zoneOptions$ | async"
          [targetTypes]="targetTypes$ | async"
          [targetOptionsMap]="targetOptionsMap$ | async"
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
        ></grove-flight>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styleUrls: ['./flight.container.scss'],
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
  targetTypes$: Observable<InventoryTargetType[]>;
  targetOptionsMap$: Observable<InventoryTargetsMap>;
  flightActualsDateBoundaries$: Observable<{ startAt: Date; endAt: Date }>;
  campaignId$: Observable<string | number>;
  @ViewChild('creative', { static: true }) creativeMatDrawer: MatDrawer;
  creativeOpenedSubscription: Subscription;
  creativeClosedSubscription: Subscription;

  constructor(private router: Router, private store: Store<any>, private campaignAction: CampaignActionService) {}

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
    this.targetTypes$ = this.store.pipe(select(selectCurrentInventoryTargetTypes));
    this.targetOptionsMap$ = this.store.pipe(select(selectCurrentInventoryTargetsTypeMap));
    this.flightActualsDateBoundaries$ = this.store.pipe(select(selectFlightActualsDateBoundaries));
    this.campaignId$ = this.store.pipe(select(selectCampaignId));

    // subscribe to creativeId route param/creative list route and open drawer
    this.creativeOpenedSubscription = combineLatest([
      this.store.pipe(select(selectRoutedCreativeId)),
      this.store.pipe(select(selectShowCreativeListRoute))
    ]).subscribe(([creativeId, showList]) => {
      if (creativeId || showList) {
        this.creativeMatDrawer.open();
      } else {
        this.creativeMatDrawer.close();
      }
    });

    // if open changes to false (user clicked overlay closing drawer), navigate back to flight
    this.creativeClosedSubscription = this.creativeMatDrawer.openedChange
      .pipe(
        filter(openChangeTo => !openChangeTo),
        withLatestFrom(this.campaignId$, this.flightLocal$)
      )
      .subscribe(([_, campaignId, flight]) => {
        if (flight) {
          this.router.navigate(['/campaign', campaignId, 'flight', flight.id]);
        }
      });
  }

  ngOnDestroy() {
    if (this.creativeOpenedSubscription) {
      this.creativeOpenedSubscription.unsubscribe();
    }
    if (this.creativeClosedSubscription) {
      this.creativeClosedSubscription.unsubscribe();
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
}
