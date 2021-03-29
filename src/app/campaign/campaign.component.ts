import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { FlightState, Campaign, Flight } from './store/models';
import {
  selectLocalCampaign,
  selectCampaignLoaded,
  selectCampaignLoading,
  selectCampaignSaving,
  selectAllFlightsOrderByCreatedAt,
  selectLocalCampaignName,
  selectValid,
  selectChanged,
  selectLocalCampaignActualCount,
  selectCampaignFlightInventoryReportData,
  selectRoutedLocalFlight,
  selectRoutedFlightDeleted
} from './store/selectors';
import * as accountActions from './store/actions/account-action.creator';
import * as advertiserActions from './store/actions/advertiser-action.creator';
import * as campaignActions from './store/actions/campaign-action.creator';
import * as inventoryActions from './store/actions/inventory-action.creator';
import { CampaignActionService } from './store/actions/campaign-action.service';
import { CampaignErrorService } from './campaign-error.service';

@Component({
  selector: 'grove-campaign',
  template: `
    <grove-campaign-status
      [campaignName]="campaignName$ | async"
      [valid]="valid$ | async"
      [changed]="changed$ | async"
      [actuals]="campaignActualCount$ | async"
      [isSaving]="campaignSaving$ | async"
      [flights]="flights$ | async"
      [reportData]="reportData$ | async"
      (save)="campaignSubmit()"
      (delete)="campaignDelete()"
      (duplicate)="campaignDuplicate()"
    ></grove-campaign-status>
    <mat-drawer-container autosize>
      <mat-drawer role="navigation" mode="side" opened disableClose>
        <grove-campaign-nav
          [campaign]="campaign$ | async"
          [flights]="flights$ | async"
          [activeFlight]="flightLocal$ | async"
          [softDeleted]="softDeleted$ | async"
          [valid]="valid$ | async"
          [changed]="changed$ | async"
          [isSaving]="campaignSaving$ | async"
          (createFlight)="createFlight()"
          (flightDuplicate)="flightDuplicate($event)"
          (flightDeleteToggle)="flightDeleteToggle()"
        ></grove-campaign-nav>
      </mat-drawer>
      <mat-drawer-content role="main">
        <ng-container *ngIf="campaignLoaded$ | async; else loading">
          <router-outlet></router-outlet>
        </ng-container>
        <ng-template #loading>
          <div class="loading" *ngIf="campaignLoading$ | async"><mat-spinner></mat-spinner></div>
        </ng-template>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styleUrls: ['./campaign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignComponent implements OnInit, OnDestroy {
  campaign$: Observable<Campaign>;
  flightLocal$: Observable<Flight>;
  softDeleted$: Observable<boolean>;
  flights$: Observable<FlightState[]>;
  campaignLoaded$: Observable<boolean>;
  campaignLoading$: Observable<boolean>;
  campaignSaving$: Observable<boolean>;
  valid$: Observable<boolean>;
  changed$: Observable<boolean>;
  campaignName$: Observable<string>;
  campaignActualCount$: Observable<number>;
  reportData$: Observable<any[][]>;
  routeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private store: Store<any>,
    private campaignActionService: CampaignActionService,
    private campaignErrorService: CampaignErrorService
  ) {}

  ngOnInit() {
    this.store.dispatch(accountActions.AccountsLoad());
    this.store.dispatch(advertiserActions.AdvertisersLoad());
    this.store.dispatch(inventoryActions.InventoryLoad());
    this.routeSub = this.route.paramMap.subscribe(params => {
      if (params.get('id')) {
        const id = +params.get('id');
        this.store.dispatch(campaignActions.CampaignLoad({ id }));
      } else {
        const { state } = window.history;
        if (state.campaign) {
          this.store.dispatch(campaignActions.CampaignDupFromForm({ campaign: state.campaign, flights: state.flights }));
        } else if (state.id) {
          this.store.dispatch(campaignActions.CampaignDupById({ id: state.id }));
        } else {
          this.store.dispatch(campaignActions.CampaignNew());
        }
      }
    });
    this.campaign$ = this.store.pipe(select(selectLocalCampaign));
    this.campaignLoaded$ = this.store.pipe(select(selectCampaignLoaded));
    this.campaignLoading$ = this.store.pipe(select(selectCampaignLoading));
    this.campaignSaving$ = this.store.pipe(select(selectCampaignSaving));
    this.campaignName$ = this.store.pipe(select(selectLocalCampaignName));
    this.campaignActualCount$ = this.store.pipe(select(selectLocalCampaignActualCount));
    this.flightLocal$ = this.store.pipe(select(selectRoutedLocalFlight));
    this.softDeleted$ = this.store.pipe(select(selectRoutedFlightDeleted));
    this.flights$ = this.store.pipe(select(selectAllFlightsOrderByCreatedAt));
    this.valid$ = this.store.pipe(select(selectValid));
    this.changed$ = this.store.pipe(select(selectChanged));
    this.reportData$ = this.store.pipe(select(selectCampaignFlightInventoryReportData));
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  campaignDelete() {
    this.campaignActionService.deleteCampaign();
  }

  campaignDuplicate() {
    this.campaignActionService.duplicateCampaign();
  }

  campaignSubmit() {
    this.campaignActionService.saveCampaignAndFlights();
  }

  createFlight() {
    this.campaignActionService.addFlight();
  }

  flightDuplicate(flight: Flight) {
    this.campaignActionService.dupFlight(flight);
  }

  flightDeleteToggle() {
    this.campaignActionService.deleteRoutedFlightToggle();
  }
}
