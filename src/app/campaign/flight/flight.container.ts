import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { Inventory, InventoryService, InventoryZone } from '../../core';
import { Flight, FlightZone, AvailabilityRollup } from '../store/models';
import { map } from 'rxjs/operators';
import {
  selectRoutedLocalFlight,
  selectRoutedFlightDeleted,
  selectRoutedFlightChanged,
  selectRoutedFlightDailyMinimum,
  selectCurrentInventoryUri,
  selectRoutedFlightAllocationPreviewError,
  selectAvailabilityRollup
} from '../store/selectors';
import { CampaignActionService } from '../store/actions/campaign-action.service';

@Component({
  selector: 'grove-flight.container',
  template: `
    <ng-container *ngIf="zoneOptions$ | async as zoneOpts">
      <grove-flight
        [inventory]="inventoryOptions$ | async"
        [zoneOptions]="zoneOpts"
        [flight]="flightLocal$ | async"
        [softDeleted]="softDeleted$ | async"
        (flightUpdate)="flightUpdateFromForm($event)"
        (flightAddZone)="flightAddZone($event)"
        (flightRemoveZone)="flightRemoveZone($event)"
        (flightDeleteToggle)="flightDeleteToggle($event)"
        (flightDuplicate)="flightDuplicate($event)"
      ></grove-flight>
      <grove-availability
        [flight]="flightLocal$ | async"
        [changed]="flightChanged$ | async"
        [zones]="zoneOpts"
        [rollups]="flightAvailabilityRollup$ | async"
        [allocationPreviewError]="allocationPreviewError$ | async"
        [dailyMinimum]="flightDailyMin$ | async"
        (goalChange)="onGoalChange($event.flight, $event.dailyMinimum)"
      >
      </grove-availability>
    </ng-container>
  `,
  styleUrls: ['flight.container.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightContainerComponent implements OnInit, OnDestroy {
  flightLocal$: Observable<Flight>;
  softDeleted$: Observable<boolean>;
  flightChanged$: Observable<boolean>;
  flightAvailabilityRollup$: Observable<AvailabilityRollup[]>;
  flightDailyMin$: Observable<number>;
  currentInventoryUri$: Observable<string>;
  allocationPreviewError$: Observable<any>;
  inventoryOptions$: Observable<Inventory[]>;
  zoneOptions$: Observable<InventoryZone[]>;
  flightSub: Subscription;

  constructor(private inventoryService: InventoryService, private store: Store<any>, private campaignAction: CampaignActionService) {}

  ngOnInit() {
    this.flightLocal$ = this.store.pipe(select(selectRoutedLocalFlight));
    this.softDeleted$ = this.store.pipe(select(selectRoutedFlightDeleted));
    this.flightChanged$ = this.store.pipe(select(selectRoutedFlightChanged));
    this.flightDailyMin$ = this.store.pipe(select(selectRoutedFlightDailyMinimum));
    this.currentInventoryUri$ = this.store.pipe(select(selectCurrentInventoryUri));
    this.allocationPreviewError$ = this.store.pipe(select(selectRoutedFlightAllocationPreviewError));
    this.flightAvailabilityRollup$ = this.store.pipe(select(selectAvailabilityRollup));

    this.inventoryOptions$ = this.inventoryService.listInventory();
    this.zoneOptions$ = combineLatest([this.inventoryOptions$, this.currentInventoryUri$]).pipe(
      map(([options, uri]) => {
        const inventory = options.find(i => i.self_uri === uri);
        return inventory ? inventory.zones : [];
      })
    );
  }

  ngOnDestroy() {
    if (this.flightSub) {
      this.flightSub.unsubscribe();
    }
  }

  flightUpdateFromForm({ flight: formFlight, changed, valid }: { flight: Flight; changed: boolean; valid: boolean }) {
    this.campaignAction.updateFlightForm(formFlight, changed, valid);
  }

  onGoalChange(flight: Flight, dailyMinimum: number) {
    this.campaignAction.setFlightGoal(flight.id, flight.totalGoal, dailyMinimum);
  }

  flightAddZone(zone: FlightZone) {
    this.campaignAction.addZone(zone);
  }

  flightRemoveZone(zone: FlightZone) {
    this.campaignAction.removeZone(zone);
  }

  flightDuplicate(flight: Flight) {
    this.campaignAction.dupFlight(flight);
  }

  flightDeleteToggle() {
    this.campaignAction.deleteRoutedFlightToggle();
  }
}
