import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { TabService } from 'ngx-prx-styleguide';
import { CampaignModel } from '../../shared/model/campaign.model';
import { FlightModel } from 'src/app/shared/model/flight.model';
import { InventoryService } from '../service/inventory.service';
import { InventoryModel } from 'src/app/shared/model/inventory.model';

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

      <prx-fancy-field number [model]="flight" name="totalGoal" label="Total Goal">
      </prx-fancy-field>
      <prx-fancy-field number [model]="flight" name="dailyMinimum" label="Daily Minimum">
      </prx-fancy-field>

      <div class="inventory-select">
        <ng-select
          [items]="inventoryOptions$ | async"
          bindLabel="title"
          bindValue="id"
          name="inventory"
          [(ngModel)]="selectedInventoryId"
          (change)="updateInventory(flight, $event)"
        ></ng-select>
      </div>
    </form>
  `,
  styleUrls: ['flight-form.component.css']
})
/*
      <prx-fancy-field
        label="Inventory"
        [model]="flight" name="inventoryId" [select]="inventoryOptions$ | async" required>
      </prx-fancy-field>
*/
export class FlightFormComponent implements OnInit {
  selectedInventoryId: number;
  inventoryOptions$: Observable<InventoryModel[]>;
  flightId: number;
  flight$: Observable<FlightModel>;

  constructor(private route: ActivatedRoute,
              private inventoryService: InventoryService,
              private tabService: TabService) {}

  updateInventory(flight: FlightModel, $event) {
    flight.inventory = $event;
  }

  ngOnInit() {
    this.inventoryOptions$ = this.inventoryService.inventory;
    this.flight$ = this.tabService.model.pipe(
      map(model => model as CampaignModel),
      mergeMap(campaign => {
        return this.route.params.pipe(
          map(params => {
            this.flightId = +params.flightId;
            let flight: FlightModel;
            if (!isNaN(this.flightId)) {
              flight = campaign.flights && campaign.flights.find(f => f.id === this.flightId);
              // If we already have an existing inventory, the select needs to know about it
              this.selectedInventoryId = flight && flight.inventory && flight.inventory.id;
            } else {
              flight = new FlightModel(campaign.doc, null, true);
              if (campaign.flights) {
                if (campaign.flights.length === 0 || campaign.flights[campaign.flights.length - 1].id) {
                  campaign.flights.push(flight);
                } else {
                  flight = campaign.flights[campaign.flights.length - 1];
                }
              }
            }
            return flight;
          })
        );
      })
    );
  }
}
