import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Flight, CampaignService } from '../../core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'grove-flight-form.container',
  template: `
    <grove-flight-form
      [flight]="flightRemote$ | async"
      (flightChanged)="flightChanged($event)"
      (flightValid)="flightValid($event)"
      (flightUpdate)="flightUpdateFromForm($event)"
    ></grove-flight-form>
  `
})
export class FlightFormContainerComponent implements OnInit {
  flightRemote$: Observable<Flight>;

  constructor(private route: ActivatedRoute, private campaignService: CampaignService, private router: Router) {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        switchMap(() => (this.route.firstChild && this.route.firstChild.params) || of({})),
        filter(params => params.flightid),
        map(params => params.flightid)
      )
      .subscribe(id => this.setFlightId(id));
  }

  ngOnInit() {}

  setFlightId(id: string) {
    this.campaignService.currentStateFirst$.subscribe(state => {
      if (state.flights[id]) {
        console.log('GOT a FLIGHT', state.flights[id]);
      } else {
        const campaignId = state.remoteCampaign ? state.remoteCampaign.id : 'new';
        this.router.navigate(['/campaign', campaignId]);
      }
    });
  }
}
