import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { Inventory, CampaignStoreService, FlightState } from 'src/app/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, first } from 'rxjs/operators';
import { InventoryService } from 'src/app/core';

@Component({
  selector: 'grove-flight.container',
  template: `
    <grove-flight
      [inventory]="inventoryOptions$ | async"
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
  inventoryOptions$: Observable<Inventory[]>;

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private campaignStoreService: CampaignStoreService,
    private router: Router
  ) {
    this.route.paramMap.subscribe(params => this.setFlightId(params.get('flightid')));
    this.inventoryOptions$ = this.inventoryService.listInventory();
  }

  ngOnInit() {}

  async setFlightId(id: string) {
    this.campaignStoreService.campaign$.pipe(first()).subscribe(state => {
      if (state.flights[id]) {
        this.currentFlightId = id;
        this.state$.next(state.flights[id]);
      } else {
        const campaignId = state.remoteCampaign ? state.remoteCampaign.id : 'new';
        this.router.navigate(['/campaign', campaignId]);
      }
    });
  }

  flightUpdateFromForm({ flight, changed, valid }) {
    this.campaignStoreService.setFlight({ localFlight: flight, changed, valid }, this.currentFlightId);
  }
}
