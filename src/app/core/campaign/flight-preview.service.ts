import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
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
      return flightDoc.follow('preview', params).pipe(mergeMap(flightPreviewDoc => flightPreviewDoc.followList('prx:flight-days')));
    } else if (campaignDoc) {
      return campaignDoc
        .follow('prx:flight-allocation-preview', params)
        .pipe(mergeMap(flightPreviewDoc => flightPreviewDoc.followList('prx:flight-days')));
    } else {
      return this.augury
        .follow('prx:flight-allocation-preview', params)
        .pipe(mergeMap(flightPreviewDoc => flightPreviewDoc.followList('prx:flight-days')));
    }
  }
}
