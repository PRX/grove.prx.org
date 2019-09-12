import { Component } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-prx-styleguide';
import { switchMap, first } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AccountService, AdvertiserService, CampaignService, Account, Advertiser, Campaign } from '../core';

@Component({
  selector: 'grove-campaign',
  template: `
    <grove-campaign-status
      [campaign]="campaignLocal$ | async"
      [isValid]="campaignValid"
      [isSaving]="campaignSaving"
      (save)="campaignSubmit()"
    ></grove-campaign-status>
    <grove-campaign-form
      [campaign]="campaignRemote$ | async"
      [advertisers]="advertisers$ | async"
      [accounts]="accounts$ | async"
      (valid)="campaignValid = $event"
      (update)="campaignUpdateFromForm($event)"
    ></grove-campaign-form>
  `,
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent {
  advertisers$: Observable<Advertiser[]>;
  accounts$: Observable<Account[]>;
  campaignRemote$ = new BehaviorSubject<Campaign>(null);
  campaignLocal$ = new BehaviorSubject<Campaign>(null);
  campaignId: number;
  campaignSaving: boolean;
  campaignValid: boolean;

  constructor(
    private accountService: AccountService,
    private advertiserService: AdvertiserService,
    private campaignService: CampaignService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.accounts$ = this.accountService.listAccounts();
    this.advertisers$ = this.advertiserService.listAdvertisers();
    this.route.paramMap
      .pipe(switchMap((params: ParamMap) => this.campaignService.getCampaign(params.get('id'))))
      .subscribe((campaign: Campaign) => this.campaignSyncFromRemote(campaign));
  }

  campaignSyncFromRemote(campaign: Campaign) {
    this.campaignId = campaign ? campaign.id : null;
    this.campaignRemote$.next(campaign);
    this.campaignLocal$.next(campaign);
  }

  campaignUpdateFromForm(updated: Campaign) {
    this.campaignLocal$.next(updated);
  }

  campaignSubmit() {
    this.campaignSaving = true;
    this.campaignLocal$
      .pipe(
        first(),
        switchMap(campaign => this.campaignService.putCampaign({ ...campaign, id: this.campaignId }))
      )
      .subscribe((campaign: Campaign) => {
        this.toastr.success('Campaign saved');
        if (!this.campaignId) {
          this.router.navigate(['/campaign', campaign.id]);
        }
        this.campaignSaving = false;
        this.campaignSyncFromRemote(campaign);
      });
  }
}
