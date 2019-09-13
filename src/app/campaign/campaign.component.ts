import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { CampaignService } from '../core';
import { ToastrService } from 'ngx-prx-styleguide';
import { Observable } from 'rxjs';

@Component({
  selector: 'grove-campaign',
  template: `
    <grove-campaign-status
      [state]="campaignService.currentState$ | async"
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
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent {
  campaignFlights$: Observable<{ id: string; name: string }[]>;
  campaignSaving: boolean;

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.route.paramMap.pipe(switchMap((params: ParamMap) => this.campaignService.getCampaign(params.get('id')))).subscribe();
    this.campaignFlights$ = this.campaignService.currentState$.pipe(
      map(state => {
        if (state && state.flights) {
          return Object.keys(state.flights).map(key => ({ id: key, name: state.flights[key].localFlight.name }));
        } else {
          return [];
        }
      })
    );
  }

  campaignSubmit() {
    let isNew = false;
    this.campaignSaving = true;
    this.campaignService.putCampaign().subscribe(newState => {
      this.toastr.success('Campaign saved');
      if (isNew) {
        this.router.navigate(['/campaign', newState.remoteCampaign.id]);
      }
      this.campaignSaving = false;
    });
  }

  createFlight() {
    this.campaignService.currentStateFirst$.subscribe(state => {
      const campaignId = state.remoteCampaign ? state.remoteCampaign.id : null;
      const flightId = Date.now();
      const num = Object.keys(state.flights).length + 1;
      state.flights[flightId] = { campaignId, localFlight: { name: `New Flight ${num}` }, changed: false, valid: true };
      this.campaignService.currentState$.next(state);
      this.router.navigate(['/campaign', campaignId || 'new', 'flight', flightId]);
    });
  }
}
