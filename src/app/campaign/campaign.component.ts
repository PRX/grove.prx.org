import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap, first, tap } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import * as actions from './store/actions';
import { FlightState } from './store/reducers';
import {
  selectError,
  selectCampaignWithFlightsForSave,
  selectCampaignLoaded,
  selectCampaignLoading,
  selectCampaignSaving,
  selectAllFlightsOrderByCreatedAt,
  selectCampaignId,
  selectLocalCampaignName,
  selectValid,
  selectChanged
} from './store/selectors';
import { AdvertiserService, AccountService } from '../core';

@Component({
  selector: 'grove-campaign',
  template: `
    <grove-campaign-status
      [campaignName]="campaignName$ | async"
      [valid]="valid$ | async"
      [changed]="changed$ | async"
      [isSaving]="campaignSaving$ | async"
      (save)="campaignSubmit()"
    ></grove-campaign-status>
    <mat-drawer-container autosize>
      <mat-drawer role="navigation" mode="side" opened disableClose>
        <grove-campaign-nav [flights]="flights$ | async" (createFlight)="createFlight()"></grove-campaign-nav>
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
  flights$: Observable<FlightState[]>;
  campaignLoaded$: Observable<boolean>;
  campaignLoading$: Observable<boolean>;
  campaignSaving$: Observable<boolean>;
  error$: Observable<any>;
  valid$: Observable<boolean>;
  changed$: Observable<boolean>;
  campaignName$: Observable<string>;
  routeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    public store: Store<any>,
    private accountService: AccountService,
    private advertiserService: AdvertiserService
  ) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap
      .pipe(
        tap(() => this.store.dispatch(new actions.CampaignLoadOptions())),
        switchMap((params: ParamMap) => {
          return this.advertiserService.loadAdvertisers().pipe(map(advertisers => ({ params, advertisers })));
        }),
        switchMap(({ params, advertisers }) => {
          return this.accountService.loadAccounts().pipe(map(accounts => ({ params, advertisers, accounts })));
        })
      )
      .subscribe(({ params, advertisers, accounts }) => {
        if (params.get('id')) {
          this.store.dispatch(new actions.CampaignLoad({ id: +params.get('id') }));
        } else {
          this.store.dispatch(new actions.CampaignNew());
        }
      });
    this.campaignLoaded$ = this.store.pipe(select(selectCampaignLoaded));
    this.campaignLoading$ = this.store.pipe(select(selectCampaignLoading));
    this.campaignSaving$ = this.store.pipe(select(selectCampaignSaving));
    this.error$ = this.store.pipe(select(selectError));
    this.campaignName$ = this.store.pipe(select(selectLocalCampaignName));
    this.flights$ = this.store.pipe(select(selectAllFlightsOrderByCreatedAt));
    this.valid$ = this.store.pipe(select(selectValid));
    this.changed$ = this.store.pipe(select(selectChanged));
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  campaignSubmit() {
    this.store
      .pipe(select(selectCampaignWithFlightsForSave), first())
      .subscribe(({ campaign, updatedFlights, createdFlights, deletedFlights }) =>
        this.store.dispatch(new actions.CampaignSave({ campaign, updatedFlights, createdFlights, deletedFlights }))
      );
  }

  createFlight() {
    this.store.pipe(select(selectCampaignId), first()).subscribe(campaignId => {
      this.store.dispatch(new actions.CampaignAddFlight({ campaignId }));
    });
  }
}
