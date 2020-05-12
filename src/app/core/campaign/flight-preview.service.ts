import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap, first } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

@Injectable()
export class FlightPreviewService {
  constructor(private augury: AuguryService) {}

  createFlightPreview(
    params: {
      name: string;
      set_inventory_uri: string;
      startAt: string;
      endAt: string;
      totalGoal: number;
      dailyMinimum: number;
      zones: string[];
    },
    flightDoc?: HalDoc,
    campaignDoc?: HalDoc
  ): Observable<HalDoc[]> {
    if (flightDoc) {
      return flightDoc.create('preview', {}, params).pipe(mergeMap(flightPreviewDoc => flightPreviewDoc.followList('prx:flight-days')));
    } else if (campaignDoc) {
      return campaignDoc
        .create('prx:flight-allocation-preview', {}, params)
        .pipe(mergeMap(flightPreviewDoc => flightPreviewDoc.followList('prx:flight-days')));
    } else {
      return this.augury.root.pipe(
        first(),
        map(root => root.create('prx:flight-allocation-preview', {}, params)),
        mergeMap(flightPreviewDoc => flightPreviewDoc.followList('prx:flight-days'))
      );
    }
  }
}
