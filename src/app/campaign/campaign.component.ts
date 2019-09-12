import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap, first, map } from 'rxjs/operators';
import { CampaignService, Campaign, Flight } from '../core';
import { CampaignFormService } from './form/campaign-form.service';
import { ToastrService } from 'ngx-prx-styleguide';
import { Observable } from 'rxjs';

@Component({
  selector: 'grove-campaign',
  template: `
    <grove-campaign-status
      [campaign]="formSvc.campaignLocal$ | async"
      [isValid]="formSvc.campaignValid"
      [isSaving]="campaignSaving"
      [isChanged]="formSvc.campaignChanged"
      (save)="campaignSubmit()"
    ></grove-campaign-status>
    <mat-drawer-container>
      <mat-drawer mode="side" opened>
        <a routerLink="">Campaign</a>
        <a routerLink="flight/add">Test</a>
        <a *ngFor="let flight of campaignFlights$ | async"> {{ flight.id }} </a>
        <button (click)="createFlight()">+ Add a Flight</button>
      </mat-drawer>
      <mat-drawer-content>
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
    protected formSvc: CampaignFormService,
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.route.paramMap
      .pipe(switchMap((params: ParamMap) => this.campaignService.getCampaign(params.get('id'))))
      .subscribe((campaign: Campaign) => this.campaignSyncFromRemote(campaign));
    this.campaignFlights$ = this.formSvc.campaignLocal$.pipe(
      map(cmp => {
        if (cmp && cmp.flights) {
          return Object.keys(cmp.flights).map(key => ({ id: key, name: cmp.flights[key].name }));
        } else {
          return [];
        }
      })
    );
  }

  campaignSyncFromRemote(campaign: Campaign) {
    this.formSvc.campaignId = campaign ? campaign.id : null;
    this.formSvc.campaignRemote$.next(campaign);
    this.formSvc.campaignLocal$.next(campaign);
  }

  campaignSubmit() {
    this.campaignSaving = true;
    this.formSvc.campaignLocal$
      .pipe(
        first(),
        switchMap(campaign => this.campaignService.putCampaign({ ...campaign, id: this.formSvc.campaignId }))
      )
      .subscribe((campaign: Campaign) => {
        this.toastr.success('Campaign saved');
        if (!this.formSvc.campaignId) {
          this.router.navigate(['/campaign', campaign.id]);
        }
        this.campaignSaving = false;
        this.campaignSyncFromRemote(campaign);
      });
  }

  createFlight() {
    const campaign = this.formSvc.campaignLocal$.getValue();
    const flightId = Date.now();
    campaign.flights[flightId] = { id: null, name: '(Untitled)' };
    this.formSvc.campaignLocal$.next(campaign);
    this.router.navigate(['/campaign', campaign.id, 'flight', flightId]);
  }
}
