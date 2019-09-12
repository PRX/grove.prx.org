import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap, first } from 'rxjs/operators';
import { CampaignService, Campaign } from '../core';
import { CampaignFormService } from './form/campaign-form.service';
import { ToastrService } from 'ngx-prx-styleguide';

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
        <a routerLink="test">Test</a>
      </mat-drawer>
      <mat-drawer-content>
        <router-outlet></router-outlet>
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent {
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
}
