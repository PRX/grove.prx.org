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
      const geo = params['geo'] && params['geo'].split('|');
      const zone = params['zone'] && params['zone'].split('|');
      const text = params['text'];
      const representative = params['representative'];
      const before = params['before'] && new Date(params['before']);
      const after = params['after'] && new Date(params['after']);
      const desc = params['desc'] && params['desc'].toLowerCase() !== 'false';
      return {page, advertiser, podcast, status, type, geo, zone, text, representative, before, after, desc};
    })
  );

  constructor(private route: ActivatedRoute) {}
}
