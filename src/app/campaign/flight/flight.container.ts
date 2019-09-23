import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReplaySubject, Observable, combineLatest } from 'rxjs';
import { Inventory, InventoryService, CampaignStoreService, FlightState, InventoryZone } from '../../core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'grove-flight.container',
  template: `
    <grove-flight
      [inventory]="inventoryOptions$ | async"
      [zoneOptions]="zoneOptions$ | async"
      [flight]="flightLocal$ | async"
      (flightUpdate)="flightUpdateFromForm($event)"
    ></grove-flight>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightContainerComponent implements OnInit {
  private currentFlightId: string;
  state$ = new ReplaySubject<FlightState>(1);
  flightLocal$ = this.state$.pipe(map(state => state.localFlight));
  currentInventoryUri$ = new ReplaySubject<string>(1);
  inventoryOptions$: Observable<Inventory[]>;
  zoneOptions$: Observable<InventoryZone[]>;

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private campaignStoreService: CampaignStoreService,
    private router: Router
  ) {
    this.route.paramMap.subscribe(params => this.setFlightId(params.get('flightid')));
    this.inventoryOptions$ = this.inventoryService.listInventory();
    this.zoneOptions$ = combineLatest(this.inventoryOptions$, this.currentInventoryUri$).pipe(
      map(([options, uri]) => {
        const inventory = options.find(i => i.self_uri === uri);
        return inventory ? inventory.zones : [];
      })
    );
  }

  ngOnInit() {}

  setFlightId(id: string) {
    this.campaignStoreService.campaignFirst$.subscribe(state => {
      if (state.flights[id]) {
        this.currentFlightId = id;
        this.state$.next(state.flights[id]);
        this.currentInventoryUri$.next(state.flights[id].localFlight.set_inventory_uri);
      } else {
        const campaignId = state.remoteCampaign ? state.remoteCampaign.id : 'new';
        this.router.navigate(['/campaign', campaignId]);
      }
    });
  }

  flightUpdateFromForm({ flight, changed, valid }) {
    this.campaignStoreService.setFlight({ localFlight: flight, changed, valid }, this.currentFlightId);
    this.currentInventoryUri$.next(flight.set_inventory_uri);
  }
}
