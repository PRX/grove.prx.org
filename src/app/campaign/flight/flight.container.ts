import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
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
import { map } from 'rxjs/operators';

@Component({
  selector: 'grove-flight.container',
  template: `
    <ng-container *ngIf="zoneOptions$ | async as zoneOpts; else loadingForm">
      <grove-flight
        [inventory]="inventoryOptions$ | async"
        [zoneOptions]="zoneOpts"
        [flight]="flightLocal$ | async"
        (flightUpdate)="flightUpdateFromForm($event)"
        (flightDeleteToggle)="flightDeleteToggle($event)"
        (flightDuplicate)="flightDuplicate($event)"
      ></grove-flight>
      <grove-availability
        *ngIf="flightAvailability$"
        [flight]="flightLocal$ | async"
        [zones]="zoneOpts"
        [availabilityZones]="flightAvailability$ | async"
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
  flightAvailability$: Observable<Availability[]>;
  currentInventoryUri$ = new ReplaySubject<string>(1);
  inventoryOptions$: Observable<Inventory[]>;
  zoneOptions$: Observable<InventoryZone[]>;
  flightSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private campaignStoreService: CampaignStoreService,
    private router: Router
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
      this.setFlightId(params.get('flightid'), campaignState);
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
      }
      this.currentFlightId = id;
      this.flightState$.next(state.flights[id]);
      this.currentInventoryUri$.next(state.flights[id].localFlight.set_inventory_uri);
    } else {
      const campaignId = state.remoteCampaign ? state.remoteCampaign.id : 'new';
      this.router.navigate(['/campaign', campaignId]);
    }
  }

  flightUpdateFromForm({ flight, changed, valid }) {
    this.campaignStoreService.setFlight({ localFlight: flight, changed, valid }, this.currentFlightId);
    this.campaignStoreService.loadAvailability(flight);
    this.currentInventoryUri$.next(flight.set_inventory_uri);
  }

  flightDuplicate(flight: Flight) {
    const localFlight: Flight = { ...flight, name: `${flight.name} (Copy)` };
    this.campaignStoreService.campaignFirst$.subscribe(state => {
      const flightId = Date.now();
      this.campaignStoreService.setFlight({ localFlight, changed: true, valid: true }, flightId);

      const campaignId = state.remoteCampaign ? state.remoteCampaign.id : 'new';
      this.router.navigate(['/campaign', campaignId, 'flight', flightId]);
    });
  }

  flightDeleteToggle() {
    this.campaignStoreService.campaignFirst$.subscribe(state => {
      const currentState = state.flights[this.currentFlightId];
      const newState = { ...currentState, softDeleted: !!!currentState.softDeleted };
      this.campaignStoreService.setFlight(newState, this.currentFlightId);
      this.flightState$.next(newState);
    });
  }
}
