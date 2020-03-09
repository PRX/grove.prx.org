import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap, first } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import * as actions from './store/actions';
import { selectLocalCampaign, selectCampaignSaving } from './store/selectors';
import { CampaignStoreService, AdvertiserService, AccountService } from '../core';
import { ToastrService } from 'ngx-prx-styleguide';

export interface LocalFlightState {
  id: string;
  name: string;
  changed: boolean;
  valid: boolean;
  softDeleted: boolean;
  statusOk: boolean;
}

@Component({
  selector: 'grove-campaign',
  template: `
    <grove-campaign-status
      [state]="campaignStoreService.campaign$ | async"
      [isSaving]="campaignSaving$ | async"
      (save)="campaignSubmit()"
    ></grove-campaign-status>
    <mat-drawer-container autosize>
      <mat-drawer role="navigation" mode="side" opened disableClose>
        <grove-campaign-nav [flights]="flights$ | async" (createFlight)="createFlight()"></grove-campaign-nav>
      </mat-drawer>
      <mat-drawer-content role="main">
        <router-outlet></router-outlet>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styleUrls: ['./campaign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignComponent implements OnInit, OnDestroy {
  flights$: Observable<FlightState[]>;
  campaignSaving$: Observable<boolean>;
  routeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    public campaignStoreService: CampaignStoreService,
    public store: Store<any>,
    private accountService: AccountService,
    private advertiserService: AdvertiserService
  ) {}

  ngOnInit() {
    this.campaignSaving$ = this.store.pipe(select(selectCampaignSaving));
    this.routeSub = this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          return this.advertiserService.loadAdvertisers().pipe(map(advertisers => ({ params, advertisers })));
        }),
        switchMap(({ params, advertisers }) => {
          return this.accountService.loadAccounts().pipe(map(accounts => ({ params, advertisers, accounts })));
        })
      )
      .subscribe(({ params, advertisers, accounts }) => {
        this.campaignStoreService.load(params.get('id'));
        if (params.get('id')) {
          this.store.dispatch(new actions.CampaignLoad({ id: +params.get('id') }));
        } else {
          this.store.dispatch(new actions.CampaignNew());
        }
      });
    this.campaignFlights$ = this.campaignStoreService.flights$.pipe(
      map(flightStates => {
        return Object.keys(flightStates).map(
          (id): LocalFlightState => {
            return {
              id,
              name: flightStates[id].localFlight.name || '(Flight)',
              softDeleted: !!flightStates[id].softDeleted,
              changed: flightStates[id].changed,
              valid: flightStates[id].valid,
              statusOk: !flightStates[id].localFlight.status || flightStates[id].localFlight.status === 'ok'
            };
          }
        );
      })
    );
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  campaignSubmit() {
    this.store
      .pipe(select(selectLocalCampaign), first())
      .subscribe(campaign => this.store.dispatch(new actions.CampaignSave({ campaign })));

    this.campaignStoreService.storeCampaign().subscribe(([changes, deletedDocs]) => {
      this.toastr.success('Campaign saved');

      // TODO: a better way to do this. like, much better.
      // TODO: when on a flight with a new campaign, don't have the new campaign.id
      //  so only route to flight if campaign already existed,
      //  otherwise just let campaign.effects route to the new campaign for now
      if (changes.id) {
        const flightId = this.router.url.split('/flight/').pop();
        if (this.router.url.includes('/flight/') && !changes.flights[flightId]) {
          this.router.navigate(['/campaign', changes.id]);
        } else if (this.router.url.includes('/flight/') && flightId !== changes.flights[flightId]) {
          this.router.navigate(['/campaign', changes.id, 'flight', changes.flights[flightId]]);
        } // else if (changes.prevId !== changes.id) {
        //   this.router.navigate(['/campaign', changes.id]);
        // }
      }
    });
  }

  createFlight() {
    this.store.dispatch(new actions.CampaignAddFlight());

    this.campaignStoreService.campaignFirst$.subscribe(state => {
      const flightId = Date.now();
      const date = new Date(flightId);
      const flight = {
        name: 'New Flight ' + (Object.keys(state.flights).length + 1),
        startAt: new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toUTCString(),
        endAt: new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1)).toUTCString(),
        totalGoal: null,
        zones: [],
        set_inventory_uri: null
      };
      this.campaignStoreService.setFlight({ localFlight: flight, changed: false, valid: true }, flightId);

      const campaignId = state.remoteCampaign ? state.remoteCampaign.id : 'new';
      this.router.navigate(['/campaign', campaignId, 'flight', flightId]);
    });
  }
}
