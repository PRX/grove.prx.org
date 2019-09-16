import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { CampaignService, CampaignStoreService } from 'src/app/core';
import { ToastrService } from 'ngx-prx-styleguide';
import { Observable } from 'rxjs';

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
          <mat-list-item>
            <button mat-flat-button color="primary" (click)="createFlight()">Add a Flight</button>
          </mat-list-item>
        </mat-nav-list>
      </mat-drawer>
      <mat-drawer-content role="main">
        <router-outlet></router-outlet>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styleUrls: ['./campaign.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignComponent {
  campaignFlights$: Observable<{ id: string; name: string }[]>;
  campaignSaving: boolean;

  constructor(
    private route: ActivatedRoute,
    protected campaignService: CampaignService,
    protected campaignStoreService: CampaignStoreService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.route.paramMap.pipe(map((params: ParamMap) => this.campaignStoreService.createWithId(params.get('id')))).subscribe();
    // TODO: move into store
    this.campaignFlights$ = this.campaignStoreService.campaign$.pipe(
      map(state => {
        if (state && state.flights) {
          return Object.keys(state.flights).map(key => ({ id: key, name: state.flights[key].localFlight.name }));
        } else {
          return [];
        }
      })
    );
  }

  async campaignSubmit() {
    const state = this.campaignStoreService.campaign;
    const isNew = !(state.remoteCampaign && state.remoteCampaign.id);
    this.campaignSaving = true;
    const newState = await this.campaignStoreService.storeCampaign();
    this.toastr.success('Campaign saved');
    if (isNew) {
      this.router.navigate(['/campaign', newState.remoteCampaign.id]);
    }
    this.campaignSaving = false;
  }

  createFlight() {
    const { campaign: state } = this.campaignStoreService;
    const campaignId = state.remoteCampaign ? state.remoteCampaign.id : null;
    const flightId = Date.now();
    const flight = {
      name: 'New Flight ' + (Object.keys(state.flights).length + 1),
      startAt: new Date().toISOString(),
      endAt: new Date().toISOString()
    };
    this.campaignStoreService.addFlight({ campaignId, localFlight: flight, changed: false, valid: true }, flightId);
    this.router.navigate(['/campaign', campaignId || 'new', 'flight', flightId]);
  }
}
