import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Creative, Account, Advertiser, CreativeState } from '../store/models';
import {
  selectRoutedCreative,
  selectAllAccounts,
  selectAllAdvertisersOrderByName,
  selectCampaignId,
  selectRoutedFlightId
} from '../store/selectors';
import * as creativeActions from '../store/actions/creative-action.creator';

@Component({
  template: `
    <grove-creative-form
      [creative]="(creative$ | async)?.creative"
      [accounts]="accounts$ | async"
      [advertisers]="advertisers$ | async"
      [campaignId]="campaignId$ | async"
      [flightId]="flightId$ | async"
      (creativeUpdate)="onCreativeUpdate($event)"
    ></grove-creative-form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativeFormContainerComponent implements OnInit, OnDestroy {
  creative$: Observable<CreativeState>;
  accounts$: Observable<Account[]>;
  advertisers$: Observable<Advertiser[]>;
  campaignId$: Observable<string | number>;
  flightId$: Observable<number>;
  routeSubscription: Subscription;

  constructor(private store: Store<any>, private route: ActivatedRoute) {}

  ngOnInit() {
    this.creative$ = this.store.pipe(select(selectRoutedCreative));
    this.accounts$ = this.store.pipe(select(selectAllAccounts));
    this.advertisers$ = this.store.pipe(select(selectAllAdvertisersOrderByName));
    this.campaignId$ = this.store.pipe(select(selectCampaignId));
    this.flightId$ = this.store.pipe(select(selectRoutedFlightId));

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

  onCreativeUpdate({ creative, changed, valid }: { creative: Creative; changed: boolean; valid: boolean }) {
    this.store.dispatch(creativeActions.CreativeFormUpdate({ creative, changed, valid }));
  }
}
