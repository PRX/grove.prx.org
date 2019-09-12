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
      [campaign]="campaign$ | async"
      (save)="campaignSubmit()"
    ></grove-campaign-status>
    <grove-campaign-form
      [campaign]="campaign$ | async"
      [advertisers]="advertisers$ | async"
      [accounts]="accounts$ | async"
      (update)="campaignUpdate($event)"
    ></grove-campaign-form>
  `,
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent {
  advertisers$: Observable<Advertiser[]>;
  accounts$: Observable<Account[]>;
  campaign$: BehaviorSubject<Campaign>;
  campaignId: number;

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
    this.campaign$ = new BehaviorSubject(null);
    this.route.paramMap
      .pipe(switchMap((params: ParamMap) => this.campaignService.getCampaign(params.get('id'))))
      .subscribe((campaign: Campaign) => {
        this.campaignId = campaign ? campaign.id : null;
        this.campaign$.next(campaign);
      });
  }

  campaignUpdate(updated: Campaign) {
    this.campaign$.next(updated);
  }

  campaignSubmit() {
    this.campaign$
      .pipe(
        first(),
        switchMap(campaign => this.campaignService.putCampaign(campaign))
      )
      .subscribe((campaign: Campaign) => {
        this.toastr.success('Campaign saved');
        if (!this.campaignId) {
          this.router.navigate(['/campaign', campaign.id]);
        }
      });
  }
}
