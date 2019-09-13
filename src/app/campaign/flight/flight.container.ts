import { Component, OnInit } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { CampaignService, FlightState, Inventory } from '../../core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { InventoryService } from 'src/app/core';

@Component({
  selector: 'grove-flight.container',
  template: `
    <grove-flight
      [inventory]="inventoryOptions$ | async"
      [flight]="flightLocal$ | async"
      (flightUpdate)="flightUpdateFromForm($event)"
    ></grove-flight>
  `
})
export class FlightContainerComponent implements OnInit {
  private currentFlightId: string;
  state$ = new ReplaySubject<FlightState>(1);
  flightLocal$ = this.state$.pipe(map(state => state.localFlight));
  inventoryOptions$: Observable<Inventory[]>;

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private campaignService: CampaignService,
    private router: Router
  ) {
    this.route.paramMap.subscribe(params => this.setFlightId(params.get('flightid')));
    this.inventoryOptions$ = this.inventoryService.listInventory();
  }

  ngOnInit() {}

  setFlightId(id: string) {
    this.campaignService.currentStateFirst$.subscribe(state => {
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
    this.campaignService.currentStateFirst$.subscribe(state => {
      const id = this.currentFlightId;
      const localFlight = { ...state.flights[id].localFlight, ...flight };
      state.flights[id] = { ...state.flights[id], localFlight, changed, valid };
      this.campaignService.currentState$.next(state);
    });
  }
}
