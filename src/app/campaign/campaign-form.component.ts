import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../core/user/user.service';
import { AuguryService } from '../core/augury.service';
import { withLatestFrom, map, switchMap } from 'rxjs/operators';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { HalDoc } from 'ngx-prx-styleguide';
import { ToastrService } from 'ngx-prx-styleguide';
import { Env } from '../core/core.env';

interface CampaignData {
  accountId: number;
  name: string;
  type: string;
  status: string;
  repName: string;
  notes: string;
  advertiserId: number;
}

@Component({
  selector: 'grove-campaign',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss']
})
export class CampaignFormComponent implements OnInit {
  advertiserOptions$: Observable<{name: string, value: string}[]>;
  accountOptions$: Observable<{name: string, value: string}[]>;
  campaignData$: Observable<CampaignData>;
  campaignDoc$: Observable<HalDoc>;

  readonly typeOptions = [
    {name: 'Paid Campaign', value: 'paid_campaign'},
    {name: 'Cross Promo', value: 'cross_promo'},
    {name: 'Cross Promo Special', value: 'cross_promo_special'},
    {name: 'Event', value: 'event'},
    {name: 'Fundraiser', value: 'fundraiser'},
    {name: 'House', value: 'house'},
    {name: 'Survey', value: 'survey'}
  ];

  readonly statusOptions = [
    {name: 'Draft', value: 'draft'},
    {name: 'Hold', value: 'hold'},
    {name: 'Sold', value: 'sold'},
    {name: 'Approved', value: 'approved'},
    {name: 'Paused', value: 'paused'},
    {name: 'Canceled', value: 'canceled'}
  ];

  campaignForm = this.fb.group({
    set_account_id: ['', Validators.required],
    name: ['', Validators.required],
    type: ['', Validators.required],
    status: ['', Validators.required],
    repName: ['', Validators.required],
    notes: [''],
    set_advertiser_uri: ['', Validators.required]
  });

  get set_account_id() { return this.campaignForm.get('set_account_id'); }
  get name() { return this.campaignForm.get('name'); }
  get type() { return this.campaignForm.get('type'); }
  get status() { return this.campaignForm.get('status'); }
  get repName() { return this.campaignForm.get('repName'); }
  get notes() { return this.campaignForm.get('notes'); }
  get set_advertiser_uri() { return this.campaignForm.get('set_advertiser_uri'); }

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private auguryService: AuguryService,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.advertiserOptions$ = this.fetchAdvertisers();

    this.campaignDoc$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.fetchCampaign(params.get('id')))
    );

    this.campaignData$ = this.formDataFromDoc();

    this.campaignData$.subscribe((result) => result ? this.updateCampaignForm(result) : null);

    this.accountOptions$ = this.userService.accounts.pipe(
      withLatestFrom(this.userService.defaultAccount),
      map(([accounts, defaultAccount]) => {
        return [defaultAccount].concat(accounts).map(acct => ({
          name: acct['name'],
          value: acct.expand('self')
        }));
      })
    );

  }

  formDataFromDoc(): Observable<CampaignData | null> {
    return this.campaignDoc$.pipe(
      map((campaign) => {
        if (campaign === null) { return null; }
        const { name, type, status, repName, notes } = campaign as any;
        const [ advertiserId, accountId ] = ['advertiser', 'account'].map(key => this.extractRelationId(key, campaign));
        return { name, type, status, repName, notes, advertiserId, accountId };
      })
    );
  }

  fetchCampaign(id: string | null): Observable<HalDoc> | Observable<null> {
    if (id === null) { return of(null); }
    const resourceName = 'campaign';
    return this.auguryService.follow(`prx:${resourceName}`, {id});
  }

  updateCampaignForm({name, type, status, repName, notes, advertiserId, accountId}: CampaignData) {
    this.campaignForm.patchValue({
      set_account_id: Env.CMS_HOST + [this.auguryService.path, 'accounts', accountId].join('/'),
      name,
      type,
      status,
      repName,
      notes,
      set_advertiser_uri: Env.AUGURY_HOST + [this.auguryService.path, 'advertisers', advertiserId].join('/')
    });
  }

  extractRelationId(key: string, resource: HalDoc) {
    return resource['_links'][`prx:${key}`]['href'].split('/').pop();
  }

  fetchAdvertisers() {
    const resourceName = 'advertisers';
    return this.auguryService.followItems(`prx:${resourceName}`).pipe(
      map((advertisers) => {
        return advertisers.map(adv => ({
          name: adv['name'], value: adv.expand('self')
        }));
      })
    );
  }

  campaignFormSubmit() {
    this.campaignDoc$.pipe(
      withLatestFrom(this.auguryService.root),
      map(([cmp, root]) => {
        let resp;
        if (cmp) {
          resp = cmp.update(this.campaignForm.value);
        } else {
          resp = root.create('prx:campaign', {}, this.campaignForm.value);
        }
        resp.subscribe(res => {
          this.toastr.success('Campaign saved');
          if (!cmp) { this.router.navigate(['/campaign', res.id]); }
        });
      })
    ).subscribe();
  }
}
