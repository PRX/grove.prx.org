import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ReplaySubject, Observable, combineLatest, Subscription } from 'rxjs';
import {
  Inventory,
  InventoryService,
  CampaignStoreService,
  FlightState,
  InventoryZone,
  Flight,
  CampaignState,
  Availability
} from '../../core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, filter, first, pluck } from 'rxjs/operators';
import * as actions from '../store/actions';
import { selectRoutedFlight } from '../store/selectors';

@Component({
  selector: 'grove-flight.container',
  template: `
    <ng-container *ngIf="zoneOptions$ | async as zoneOpts; else loadingForm">
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
    <ng-template #loadingForm>
      <div class="loading-form"><mat-spinner></mat-spinner></div>
    </ng-template>
  `,
  styleUrls: ['flight.container.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightContainerComponent implements OnInit, OnDestroy {
  private currentFlightId: string;
  flightState$ = new ReplaySubject<FlightState>(1);
  flightLocal$ = this.flightState$.pipe(map((state: FlightState) => state.localFlight));
  softDeleted$ = this.flightState$.pipe(map(state => state.softDeleted));
  flightChanged$ = this.flightState$.pipe(pluck('changed'));
  flightAvailability$: Observable<Availability[]>;
  flightDailyMin$: Observable<number>;
  currentInventoryUri$ = new ReplaySubject<string>(1);
  inventoryOptions$: Observable<Inventory[]>;
  zoneOptions$: Observable<InventoryZone[]>;
  flightSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private campaignStoreService: CampaignStoreService,
    private router: Router,
    private store: Store<any>
  ) {}

  ngOnInit() {
    this.inventoryOptions$ = this.inventoryService.listInventory();
    this.zoneOptions$ = combineLatest(this.inventoryOptions$, this.currentInventoryUri$).pipe(
      map(([options, uri]) => {
        const inventory = options.find(i => i.self_uri === uri);
        return inventory ? inventory.zones : [];
      })
    );
    this.flightSub = combineLatest(this.route.paramMap, this.campaignStoreService.campaign$).subscribe(([params, campaignState]) => {
      this.setFlightId(params.get('flightId'), campaignState);
    });
  }

  ngOnDestroy() {
    if (this.flightSub) {
      this.flightSub.unsubscribe();
    }
  }

  setFlightId(id: string, state: CampaignState) {
    if (state.flights[id]) {
      if (this.currentFlightId !== id) {
        this.campaignStoreService.loadAvailability(state.flights[id].localFlight);
        this.flightAvailability$ = this.campaignStoreService.getFlightAvailabilityRollup$(id);
        this.flightDailyMin$ = this.campaignStoreService.getFlightDailyMin$(id);
      }
      this.currentFlightId = id;
      this.flightState$.next(state.flights[id]);
      this.currentInventoryUri$.next(state.flights[id].localFlight.set_inventory_uri);
    } /*
    else {
      TODO: what to do about an invalid flight id and how to tell if a flight doesn't exist or hasn't yet been loaded into state
      TODO: I think when I removed this, it broke the browser refresh on a new flight form, just shows loading spinner
    }*/
  }

  flightUpdateFromForm({ flight, changed, valid }) {
    this.loadAvailabilityAllocationIfChanged(flight);
    this.campaignStoreService.setFlight({ localFlight: flight, changed, valid }, this.currentFlightId);
    this.currentInventoryUri$.next(flight.set_inventory_uri);

    this.store
      .pipe(
        select(selectRoutedFlight),
        filter(state => !!(state && state.id)),
        first()
      )
      .subscribe(state =>
        this.store.dispatch(
          new actions.CampaignFlightFormUpdate({
            id: state.id,
            flight: { ...flight, startAt: new Date(flight.startAt.valueOf()), endAt: new Date(flight.endAt.valueOf()) },
            changed,
            valid
          })
        )
      );
  }

  loadAvailabilityAllocationIfChanged(flight: Flight) {
    this.flightState$
      .pipe(
        filter((flightState: FlightState) => {
          // determine if the availability fields are present and have changed since the last update from form
          const { localFlight } = flightState;
          const idMatch = flight.id === localFlight.id;
          // dates come back as Date but typed string on Flight
          const flightStartAtDate = flight.startAt && new Date(flight.startAt.valueOf());
          const flightEndAtDate = flight.endAt && new Date(flight.endAt.valueOf());
          const dateRangeValid = flightStartAtDate && flightEndAtDate && flightStartAtDate.valueOf() < flightEndAtDate.valueOf();
          const hasAvailabilityParams =
            flight.startAt && flight.endAt && flight.set_inventory_uri && flight.zones && flight.zones.length > 0;
          const availabilityParamsChanged =
            hasAvailabilityParams &&
            (flightStartAtDate.valueOf() !== new Date(localFlight.startAt).valueOf() ||
              flightEndAtDate.valueOf() !== new Date(localFlight.endAt).valueOf() ||
              flight.set_inventory_uri !== localFlight.set_inventory_uri ||
              !flight.zones.every(zone => localFlight.zones.indexOf(zone) > -1));
          return idMatch && dateRangeValid && availabilityParamsChanged;
        }),
        first()
      )
      .subscribe(() => {
        this.campaignStoreService.loadAvailability(flight, this.currentFlightId);
        if (flight.totalGoal) {
          this.campaignStoreService.loadAllocationPreview(flight, this.currentFlightId);
        }
      });
  }

  onGoalChange(flight: Flight, dailyMinimum: number) {
    const valid = flight.totalGoal && flight.startAt.valueOf() !== flight.endAt.valueOf();
    this.campaignStoreService.setFlight({ localFlight: flight, changed: true, valid }, this.currentFlightId);
    if (valid) {
      this.campaignStoreService.loadAllocationPreview(flight, this.currentFlightId, dailyMinimum);
    }
  }

  get allocationPreviewError() {
    return this.campaignStoreService.allocationPreviewError;
  }

  flightDuplicate(flight: Flight) {
    const storeFlight = { ...flight, startAt: new Date(flight.startAt.valueOf()), endAt: new Date(flight.endAt.valueOf()) };
    this.store.dispatch(new actions.CampaignDupFlight({ flight: storeFlight }));

    const localFlight: Flight = { ...flight, name: `${flight.name} (Copy)` };
    this.campaignStoreService.campaignFirst$.subscribe(state => {
      const flightId = Date.now();
      this.campaignStoreService.setFlight({ localFlight, changed: true, valid: true }, flightId);

      const campaignId = state.remoteCampaign ? state.remoteCampaign.id : 'new';
      this.router.navigate(['/campaign', campaignId, 'flight', flightId]);
    });
  }

  flightDeleteToggle() {
    this.store
      .pipe(
        select(selectRoutedFlight),
        filter(state => !!(state && state.id)),
        first()
      )
      .subscribe(state => this.store.dispatch(new actions.CampaignDeleteFlight({ id: state.id, softDeleted: !state.softDeleted })));

    this.campaignStoreService.campaignFirst$.subscribe(state => {
      const currentState = state.flights[this.currentFlightId];
      const newState = { ...currentState, changed: true, softDeleted: !currentState.softDeleted };
      this.campaignStoreService.setFlight(newState, this.currentFlightId);
      this.flightState$.next(newState);
    });
  }
}
