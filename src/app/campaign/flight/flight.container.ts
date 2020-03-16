import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { Inventory, InventoryService, CampaignStoreService, InventoryZone, Availability } from '../../core';
import { Flight } from '../store/models';
import { map, filter, first } from 'rxjs/operators';
import {
  selectCampaignId,
  selectRoutedFlight,
  selectRoutedLocalFlight,
  selectRoutedFlightDeleted,
  selectRoutedFlightChanged,
  selectRoutedFlightDailyMinimum,
  selectCurrentInventoryUri
} from '../store/selectors';
import { CampaignFlightSetGoal, CampaignFlightFormUpdate, CampaignDupFlight, CampaignDeleteFlight } from '../store/actions';

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
        (flightDeleteToggle)="flightDeleteToggle($event)"
        (flightDuplicate)="flightDuplicate($event)"
      ></grove-flight>
      <grove-availability
        *ngIf="flightAvailability$"
        [flight]="flightLocal$ | async"
        [changed]="flightChanged$ | async"
        [zones]="zoneOpts"
        [availabilityZones]="flightAvailability$ | async"
        [allocationPreviewError]="allocationPreviewError"
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
  private currentFlightId: number;
  flightLocal$: Observable<Flight>;
  softDeleted$: Observable<boolean>;
  flightChanged$: Observable<boolean>;
  flightAvailability$: Observable<Availability[]>;
  flightDailyMin$: Observable<number>;
  currentInventoryUri$: Observable<string>;
  inventoryOptions$: Observable<Inventory[]>;
  zoneOptions$: Observable<InventoryZone[]>;
  flightSub: Subscription;

  constructor(private inventoryService: InventoryService, private campaignStoreService: CampaignStoreService, private store: Store<any>) {}

  ngOnInit() {
    this.flightLocal$ = this.store.pipe(select(selectRoutedLocalFlight));
    this.softDeleted$ = this.store.pipe(select(selectRoutedFlightDeleted));
    this.flightChanged$ = this.store.pipe(select(selectRoutedFlightChanged));
    this.flightDailyMin$ = this.store.pipe(select(selectRoutedFlightDailyMinimum));
    this.currentInventoryUri$ = this.store.pipe(select(selectCurrentInventoryUri));
    this.flightAvailability$ = this.campaignStoreService.getFlightAvailabilityRollup$();

    this.inventoryOptions$ = this.inventoryService.listInventory();
    this.zoneOptions$ = combineLatest([this.inventoryOptions$, this.currentInventoryUri$]).pipe(
      map(([options, uri]) => {
        const inventory = options.find(i => i.self_uri === uri);
        return inventory ? inventory.zones : [];
      })
    );
    this.onFlightIdChangeLoadAvailability();
  }

  ngOnDestroy() {
    if (this.flightSub) {
      this.flightSub.unsubscribe();
    }
  }

  onFlightIdChangeLoadAvailability() {
    this.flightSub = this.flightLocal$.pipe(filter(flight => flight && this.currentFlightId !== flight.id)).subscribe(flight => {
      this.campaignStoreService.loadAvailability(flight);
      this.currentFlightId = flight.id;
    });
  }

  flightUpdateFromForm({ flight: formFlight, changed, valid }: { flight: Flight; changed: boolean; valid: boolean }) {
    this.store
      .pipe(
        select(selectRoutedFlight),
        filter(state => !!(state && state.id)),
        first()
      )
      .subscribe(state => {
        this.loadAvailabilityAllocationIfChanged(formFlight, state.localFlight, state.dailyMinimum);
        this.store.dispatch(
          new CampaignFlightFormUpdate({
            flight: formFlight,
            changed,
            valid
          })
        );
      });
  }

  loadAvailabilityAllocationIfChanged(formFlight: Flight, localFlight: Flight, dailyMinimum: number) {
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
        this.campaignStoreService.loadAllocationPreview(formFlight, dailyMinimum);
      }
    }
  }

  onGoalChange(flight: Flight, dailyMinimum: number) {
    const valid = flight.totalGoal && flight.startAt.valueOf() !== flight.endAt.valueOf();
    this.store.dispatch(new CampaignFlightSetGoal({ flightId: flight.id, totalGoal: flight.totalGoal, dailyMinimum, valid }));
    if (valid) {
      this.campaignStoreService.loadAllocationPreview(flight, dailyMinimum);
    }
  }

  get allocationPreviewError() {
    return this.campaignStoreService.allocationPreviewError;
  }

  flightDuplicate(flight: Flight) {
    this.store.pipe(select(selectCampaignId), first()).subscribe(campaignId => {
      this.store.dispatch(new CampaignDupFlight({ campaignId, flight }));
    });
  }

  flightDeleteToggle() {
    this.store
      .pipe(
        select(selectRoutedFlight),
        filter(state => !!(state && state.id)),
        first()
      )
      .subscribe(state => this.store.dispatch(new CampaignDeleteFlight({ id: state.id, softDeleted: !state.softDeleted })));
  }
}
