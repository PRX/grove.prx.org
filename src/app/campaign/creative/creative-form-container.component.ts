import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { first, withLatestFrom } from 'rxjs/operators';
import { Creative, Account, Advertiser, CreativeState } from '../store/models';
import {
  selectRoutedCreative,
  selectAllAccounts,
  selectAllAdvertisersOrderByName,
  selectCampaignId,
  selectRoutedFlightId,
  selectRoutedFlightZoneId
} from '../store/selectors';
import * as creativeActions from '../store/actions/creative-action.creator';

@Component({
  template: `
    <mat-toolbar color="primary">
      <mat-toolbar-row>
        <mat-icon>attach_file</mat-icon> Creative Management
        <button mat-button aria-label="cancel" (click)="onCancel()"><mat-icon>clear</mat-icon></button>
      </mat-toolbar-row>
    </mat-toolbar>
    <grove-creative-form
      *ngIf="creativeState$ | async as creativeState"
      [creative]="creativeState.creative"
      [accounts]="accounts$ | async"
      [advertisers]="advertisers$ | async"
      [campaignId]="campaignId$ | async"
      [flightId]="flightId$ | async"
      (formUpdate)="onFormUpdate($event)"
      (save)="onSave($event)"
      (cancel)="onCancel($event)"
    ></grove-creative-form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativeFormContainerComponent implements OnInit, OnDestroy {
  creativeState$: Observable<CreativeState>;
  accounts$: Observable<Account[]>;
  advertisers$: Observable<Advertiser[]>;
  campaignId$: Observable<string | number>;
  flightId$: Observable<number>;
  zoneId$: Observable<string>;
  routeSubscription: Subscription;

  constructor(private store: Store<any>, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.creativeState$ = this.store.pipe(select(selectRoutedCreative));
    this.accounts$ = this.store.pipe(select(selectAllAccounts));
    this.advertisers$ = this.store.pipe(select(selectAllAdvertisersOrderByName));
    this.campaignId$ = this.store.pipe(select(selectCampaignId));
    this.flightId$ = this.store.pipe(select(selectRoutedFlightId));
    this.zoneId$ = this.store.pipe(select(selectRoutedFlightZoneId));

    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const creativeIdParam = params.get('creativeId');
      if (creativeIdParam) {
        if (creativeIdParam === 'new') {
          this.store.dispatch(creativeActions.CreativeNew());
        } else {
          const id = +params.get('creativeId');
          this.store.dispatch(creativeActions.CreativeLoad({ id }));
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  onFormUpdate({ creative, changed, valid }: { creative: Creative; changed: boolean; valid: boolean }) {
    this.store.dispatch(creativeActions.CreativeFormUpdate({ creative, changed, valid }));
  }

  onSave(creative) {
    this.creativeState$
      .pipe(withLatestFrom(this.campaignId$, this.flightId$, this.zoneId$), first())
      .subscribe(([state, campaignId, flightId, zoneId]) => {
        if (state && state.doc) {
          this.store.dispatch(creativeActions.CreativeUpdate({ campaignId, flightId, zoneId, creativeDoc: state && state.doc, creative }));
        } else {
          this.store.dispatch(creativeActions.CreativeCreate({ campaignId, flightId, zoneId, creative }));
        }
      });
  }

  onCancel() {
    this.campaignId$
      .pipe(withLatestFrom(this.flightId$), first())
      .subscribe(([campaignId, flightId]) => this.router.navigate(['/campaign', campaignId, 'flight', flightId]));
  }
}
