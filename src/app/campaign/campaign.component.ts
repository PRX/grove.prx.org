import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, Observer } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { FlightState, Campaign } from './store/models';
import {
  selectError,
  selectLocalCampaign,
  selectCampaignLoaded,
  selectCampaignLoading,
  selectCampaignSaving,
  selectAllFlightsOrderByCreatedAt,
  selectLocalCampaignName,
  selectValid,
  selectChanged,
  selectLocalCampaignActualCount
} from './store/selectors';
import * as accountActions from './store/actions/account-action.creator';
import * as advertiserActions from './store/actions/advertiser-action.creator';
import * as campaignActions from './store/actions/campaign-action.creator';
import { CampaignActionService } from './store/actions/campaign-action.service';

@Component({
  selector: 'grove-campaign',
  template: `
    <grove-campaign-status
      [campaignName]="campaignName$ | async"
      [valid]="valid$ | async"
      [changed]="changed$ | async"
      [actuals]="campaignActualCount$ | async"
      [isSaving]="campaignSaving$ | async"
      (save)="campaignSubmit()"
      (delete)="campaignDelete()"
      (duplicate)="campaignDuplicate()"
    ></grove-campaign-status>
    <mat-drawer-container autosize>
      <mat-drawer role="navigation" mode="side" opened disableClose>
        <grove-campaign-nav
          [campaign]="campaign$ | async"
          [flights]="flights$ | async"
          [valid]="valid$ | async"
          [changed]="changed$ | async"
          [isSaving]="campaignSaving$ | async"
          (createFlight)="createFlight()"
        ></grove-campaign-nav>
      </mat-drawer>
      <mat-drawer-content role="main">
        <ng-container *ngIf="campaignLoaded$ | async; else loading">
          <div class="error" *ngIf="error$ | async as error; else content">{{ error }}</div>
          <ng-template #content>
            <router-outlet></router-outlet>
          </ng-template>
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
  flights$: Observable<FlightState[]>;
  campaignLoaded$: Observable<boolean>;
  campaignLoading$: Observable<boolean>;
  campaignSaving$: Observable<boolean>;
  error$: Observable<any>;
  valid$: Observable<boolean>;
  changed$: Observable<boolean>;
  campaignName$: Observable<string>;
  campaignActualCount$: Observable<number>;
  routeSub: Subscription;

  constructor(private route: ActivatedRoute, private store: Store<any>, private campaignActionService: CampaignActionService) {}

  ngOnInit() {
    this.store.dispatch(new accountActions.AccountsLoad({}));
    this.store.dispatch(new advertiserActions.AdvertisersLoad({}));
    this.routeSub = this.route.paramMap.subscribe(params => {
      if (params.get('id')) {
        const id = +params.get('id');
        this.store.dispatch(new campaignActions.CampaignLoad({ id }));
      } else {
        const { state } = window.history;
        if (state.campaign) {
          this.store.dispatch(new campaignActions.CampaignDupFromForm({ campaign: state.campaign, flights: state.flights }));
        } else if (state.id) {
          this.store.dispatch(new campaignActions.CampaignDupById({ id: state.id }));
        } else {
          this.store.dispatch(new campaignActions.CampaignNew({}));
        }
      }
    });
    this.campaign$ = this.store.pipe(select(selectLocalCampaign));
    this.campaignLoaded$ = this.store.pipe(select(selectCampaignLoaded));
    this.campaignLoading$ = this.store.pipe(select(selectCampaignLoading));
    this.campaignSaving$ = this.store.pipe(select(selectCampaignSaving));
    this.error$ = this.store.pipe(select(selectError));
    this.campaignName$ = this.store.pipe(select(selectLocalCampaignName));
    this.campaignActualCount$ = this.store.pipe(select(selectLocalCampaignActualCount));
    this.flights$ = this.store.pipe(select(selectAllFlightsOrderByCreatedAt));
    this.valid$ = this.store.pipe(select(selectValid));
    this.changed$ = this.store.pipe(select(selectChanged));
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
}
