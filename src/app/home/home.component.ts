import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CampaignParams } from '../campaign-list/campaign-list.service';

@Component({
  template: `<grove-campaign-list [routedParams]="params$ | async"></grove-campaign-list>`
})

export class HomeComponent {
  params$: Observable<CampaignParams> = this.route.queryParams.pipe(
    map((params): CampaignParams => {
      const page = params['page'] && +params['page'];
      const advertiser = params['advertiser'] && +params['advertiser'];
      const podcast = params['podcast'] && +params['podcast'];
      const status = params['status'];
      const type = params['type'];
      const geo = params['geo'];
      const zone = params['zone'];
      const text = params['text'];
      const representative = params['representative'];
      const before = params['before'] && new Date(params['before']);
      const after = params['after'] && new Date(params['after']);
      return {page, advertiser, podcast, status, type, geo, zone, text, representative, before, after};
    })
  );

  constructor(private route: ActivatedRoute) {}
}
