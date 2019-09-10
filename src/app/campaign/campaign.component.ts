import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HalDoc, ToastrService } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';
import { map, withLatestFrom, switchMap } from 'rxjs/operators';
import { UserService } from '../core/user/user.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'grove-campaign',
  template: `
    <prx-status-bar>
      <a prx-status-bar-link routerLink="/">
        <prx-status-bar-icon name="chevron-left" aria-label="Return To Home"></prx-status-bar-icon>
      </a>
      <prx-status-bar-text bold uppercase>Episode</prx-status-bar-text>
      <prx-status-bar-text italic stretch>Honey, your puns are tearing this relationship apart</prx-status-bar-text>
      <a prx-status-bar-link routerLink="/series/12344" alignArt="right">
        <prx-status-bar-image src="https://placebear.com/40/40" alignAart="right"></prx-status-bar-image> Bearly Bearable
      </a>
    </prx-status-bar>
    <grove-campaign-form
      [campaign]="campaignObject$ | async"
      [advertisers]="advertiserOptions$ | async"
      [accounts]="accountOptions$ | async"
      (campaignSubmit)="updateCampaign($event)"
    ></grove-campaign-form>
  `,
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent implements OnInit {
  advertiserOptions$: Observable<{ name: string; value: string }[]>;
  accountOptions$: Observable<{ name: string; value: string }[]>;
  campaignDoc$: Observable<HalDoc>;
  campaignObject$: Observable<{}>;

  constructor(
    private auguryService: AuguryService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.campaignDoc$ = this.route.paramMap.pipe(switchMap((params: ParamMap) => this.fetchCampaign(params.get('id'))));
    this.campaignObject$ = this.campaignDoc$.pipe(
      map(campaign => {
        if (!campaign) {
          return null;
        }
        const campaignObj = campaign.asJSON();
        campaignObj['set_advertiser_uri'] = campaign.expand('prx:advertiser');
        campaignObj['set_account_uri'] = campaign.expand('prx:account');
        return campaignObj;
      })
    );
    this.advertiserOptions$ = this.fetchAdvertisers();
    this.accountOptions$ = this.fetchAccounts();
  }

  fetchCampaign(id: string | null): Observable<HalDoc> {
    if (id === null) {
      return of(null);
    }
    const resourceName = 'campaign';
    return this.auguryService.follow(`prx:${resourceName}`, { id });
  }

  fetchAdvertisers() {
    const resourceName = 'advertisers';
    return this.auguryService.followItems(`prx:${resourceName}`).pipe(
      map(advertisers => {
        return advertisers.map(adv => ({
          name: adv['name'],
          value: adv.expand('self')
        }));
      })
    );
  }

  fetchAccounts() {
    return this.userService.accounts.pipe(
      withLatestFrom(this.userService.defaultAccount),
      map(([accounts, defaultAccount]) => {
        return [defaultAccount].concat(accounts).map(acct => ({
          name: acct['name'],
          value: acct.expand('self')
        }));
      })
    );
  }

  updateCampaign(campaignData) {
    this.campaignDoc$
      .pipe(
        withLatestFrom(this.auguryService.root),
        map(([cmp, root]) => {
          let resp;
          if (cmp) {
            resp = cmp.update(campaignData);
          } else {
            resp = root.create('prx:campaign', {}, campaignData);
          }
          resp.subscribe(res => {
            this.toastr.success('Campaign saved');
            if (!cmp) {
              this.router.navigate(['/campaign', res.id]);
            }
          });
        })
      )
      .subscribe();
  }
}
