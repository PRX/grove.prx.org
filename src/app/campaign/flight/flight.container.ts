import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ReplaySubject, Observable, combineLatest, Subscription } from 'rxjs';
import { Inventory, InventoryService, CampaignStoreService, FlightState, InventoryZone, CampaignState, Availability } from '../../core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'grove-flight.container',
  template: `
    <grove-flight
      [inventory]="inventoryOptions$ | async"
      [zoneOptions]="zoneOptions$ | async"
      [flight]="flightLocal$ | async"
      (flightUpdate)="flightUpdateFromForm($event)"
    ></grove-flight>
    <grove-availability
      *ngIf="flightAvailability$ && flightAvailabilityTotals$"
      [flight]="flightLocal$ | async"
      [zones]="zoneOptions$ | async"
      [availabilityZones]="flightAvailability$ | async"
      [totals]="flightAvailabilityTotals$ | async">
    </grove-availability>
  `,
  styleUrls: ['flight.container.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightContainerComponent implements OnInit, OnDestroy {
  private currentFlightId: string;
  flightState$ = new ReplaySubject<FlightState>(1);
  flightLocal$ = this.flightState$.pipe(map((state: FlightState) => state.localFlight));
  flightAvailability$: Observable<Availability[]>;
  flightAvailabilityTotals$: Observable<{allocated: number, availability: number}[]>;
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
    this.flightSub = combineLatest(this.route.paramMap, this.campaignStoreService.campaign$).subscribe(([params, campaignState]) => {
      this.setFlightId(params.get('flightid'), campaignState);
    });

    this.inventoryOptions$ = this.inventoryService.listInventory();
    this.zoneOptions$ = combineLatest(this.inventoryOptions$, this.currentInventoryUri$).pipe(
      map(([options, uri]) => {
        const inventory = options.find(i => i.self_uri === uri);
        return inventory ? inventory.zones : [];
      })
    );
  }

  ngOnDestroy() {
    if (this.flightSub) { this.flightSub.unsubscribe(); }
  }

  setFlightId(id: string, state: CampaignState) {
    if (state.flights[id]) {
      if (this.currentFlightId !== id) {
        this.campaignStoreService.loadAvailability(state.flights[id].localFlight);
        this.flightAvailability$ = this.campaignStoreService.getFlightAvailabilityRollup$(id);
        this.flightAvailabilityTotals$ = this.campaignStoreService.getFlightAvailabilityTotals$(id);
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
}
