import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardParams } from '../dashboard/dashboard.service';

@Component({
  template: `
    <grove-dashboard [routedParams]="params$ | async"></grove-dashboard>
  `
})
export class HomeComponent {
  params$: Observable<DashboardParams> = this.route.queryParams.pipe(
    map(
      (params): DashboardParams => {
        const view = params['view'] || 'flights';
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
        return { view, page, advertiser, podcast, status, type, geo, zone, text, representative, before, after, desc };
      }
    )
  );

  constructor(private route: ActivatedRoute) {}
}
