import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { TabService } from 'ngx-prx-styleguide';
import { CampaignModel } from '../../shared/model/campaign.model';
import { FlightModel } from 'src/app/shared/model/flight.model';

@Component({
  template: `
    <form *ngIf="flight$ | async as flight">
      <prx-fancy-field
        label="Flight Name"
        textinput [model]="flight" name="name" required>
      </prx-fancy-field>

      <prx-fancy-field label="Start and End Dates">
        <span>Expected </span>
        <prx-datepicker [date]="flight.startDate" (dateChange)="flight.set('startDate', $event)" [changed]="flight.changed('startDate')">
        </prx-datepicker>
        <prx-datepicker [date]="flight.endDate" (dateChange)="flight.set('endDate', $event)" [changed]="flight.changed('endDate')">
        </prx-datepicker>
      </prx-fancy-field>
    </form>
  `
})
export class FlightFormComponent implements OnInit {
  flightId: number;
  flight$: Observable<FlightModel>;

  constructor(private route: ActivatedRoute,
              private tabService: TabService) {}

  ngOnInit() {
    this.flight$ = this.tabService.model.pipe(
      map(model => model as CampaignModel),
      mergeMap(campaign => {
        return this.route.params.pipe(
          map(params => {
            this.flightId = +params.flightId;
            let flight: FlightModel;
            if (!isNaN(this.flightId)) {
              flight = campaign.flights && campaign.flights.find(f => f.id === this.flightId);
            } else {
              flight = new FlightModel(campaign.doc, null);
              if (campaign.flights) {
                if (campaign.flights.length === 0 || campaign.flights[campaign.flights.length - 1].id) {
                  campaign.flights.push(flight);
                } else {
                  flight = campaign.flights[campaign.flights.length - 1];
                }
              } else {
                campaign.flights = [flight];
              }
            }
            return flight;
          })
        );
      })
    );
  }
}
