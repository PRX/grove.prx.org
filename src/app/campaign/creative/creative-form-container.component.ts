import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Creative, Account, Advertiser } from '../store/models';
import { selectAllAccounts, selectAllAdvertisersOrderByName, selectCampaignId, selectRoutedFlightId } from '../store/selectors';
import * as creativeActions from '../store/actions/creative-action.creator';
import * as advertiserActions from '../store/actions/advertiser-action.creator';

@Component({
  template: `
    <grove-creative-form
      [creative]="creative$ | async"
      [accounts]="accounts$ | async"
      [advertisers]="advertisers$ | async"
      [campaignId]="campaignId$ | async"
      [flightId]="flightId$ | async"
    ></grove-creative-form>
  `,
  // styleUrls: ['./grove-creative-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreativeFormContainerComponent implements OnInit, OnDestroy {
  creative$: Observable<Creative>;
  accounts$: Observable<Account[]>;
  advertisers$: Observable<Advertiser[]>;
  campaignId$: Observable<string | number>;
  flightId$: Observable<number>;
  routeSubscription: Subscription;

  constructor(private store: Store<any>, private route: ActivatedRoute) {}

  ngOnInit() {
    this.accounts$ = this.store.pipe(select(selectAllAccounts));
    this.advertisers$ = this.store.pipe(select(selectAllAdvertisersOrderByName));
    this.campaignId$ = this.store.pipe(select(selectCampaignId));
    this.flightId$ = this.store.pipe(select(selectRoutedFlightId));

    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const creativeIdParam = params.get('creativeId');
      if (creativeIdParam) {
        if (creativeIdParam === 'new') {
          this.store.dispatch(creativeActions.CampaignCreativeNew());
        } else {
          const id = +params.get('creativeId');
          this.store.dispatch(creativeActions.CampaignCreativeLoad({ id }));
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  onAddAdvertiser(name: string) {
    this.store.dispatch(advertiserActions.AddAdvertiser({ name }));
  }
}
