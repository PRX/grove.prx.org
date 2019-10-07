import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CampaignStoreService, AdvertiserService } from '../core';
import { ToastrService } from 'ngx-prx-styleguide';

@Component({
  selector: 'grove-campaign',
  template: `
    <grove-campaign-status
      [state]="campaignStoreService.campaign$ | async"
      [isSaving]="campaignSaving"
      (save)="campaignSubmit()"
    ></grove-campaign-status>
    <mat-drawer-container autosize>
      <mat-drawer role="navigation" mode="side" opened disableClose>
        <mat-nav-list>
          <a mat-list-item routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }" routerLink="./">Campaign</a>
          <a
            mat-list-item
            *ngFor="let flight of campaignFlights$ | async"
            [routerLink]="['flight', flight.id]"
            routerLinkActive="active-link"
          >
            {{ flight.name }}
          </a>
        </mat-nav-list>
        <div class="add-flight">
          <a [routerLink]="" (click)="createFlight()">+ Add a Flight</a>
        </div>
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
  campaignFlights$: Observable<{ id: string; name: string }[]>;
  campaignSaving: boolean;
  routeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    public campaignStoreService: CampaignStoreService,
    private advertiserService: AdvertiserService
  ) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.advertiserService.loadAdvertisers().pipe(
          map(advertisers => ({params, advertisers}))
        );
      })
    ).subscribe(({params, advertisers}) => {
      this.campaignStoreService.load(params.get('id'));
    });
    this.campaignFlights$ = this.campaignStoreService.flights$.pipe(
      map(flightStates => {
        return Object.keys(flightStates).map(id => {
          return { id, name: flightStates[id].localFlight.name || '(Flight)' };
        });
      })
    );
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  campaignSubmit() {
    this.campaignSaving = true;
    this.campaignStoreService.storeCampaign().subscribe(changes => {
      this.toastr.success('Campaign saved');
      this.campaignSaving = false;

      // TODO: a better way to do this. like, much better.
      const flightId = this.router.url.split('/flight/').pop();
      if (this.router.url.includes('/flight/') && flightId !== changes.flights[flightId]) {
        this.router.navigate(['/campaign', changes.id, 'flight', changes.flights[flightId]]);
      } else if (changes.prevId !== changes.id) {
        this.router.navigate(['/campaign', changes.id]);
      }
    });
  }

  createFlight() {
    this.campaignStoreService.campaignFirst$.subscribe(state => {
      const flightId = Date.now();
      const flight = {
        name: 'New Flight ' + (Object.keys(state.flights).length + 1),
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
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
