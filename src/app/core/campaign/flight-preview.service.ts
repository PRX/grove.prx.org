import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap, first } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { Moment } from 'moment';

@Injectable()
export class FlightPreviewService {
  constructor(private augury: AuguryService) {}

  createFlightPreview(
    flight: {
      name: string;
      set_inventory_uri: string;
      startAt: Moment;
      endAt: Moment;
      zones: {
        id: string;
        label?: string;
        url?: string;
        fileSize?: number;
        mimeType?: string;
      }[];
      totalGoal?: number;
      dailyMinimum?: number;
    },
    flightDoc?: HalDoc,
    campaignDoc?: HalDoc
  ): Observable<HalDoc[]> {
    const startAt = flight.startAt.toISOString().slice(0, 10);
    const endAt = flight.endAt.toISOString().slice(0, 10);
    const totalGoal = flight.totalGoal || 0;
    const dailyMinimum = flight.dailyMinimum || 0;

    if (flightDoc) {
      return flightDoc
        .create('preview', {}, { ...flight, startAt, endAt, totalGoal, dailyMinimum })
        .pipe(mergeMap(flightPreviewDoc => flightPreviewDoc.followList('prx:flight-days')));
    } else if (campaignDoc) {
      return campaignDoc
        .create('prx:flight-allocation-preview', {}, { ...flight, startAt, endAt, totalGoal, dailyMinimum })
        .pipe(mergeMap(flightPreviewDoc => flightPreviewDoc.followList('prx:flight-days')));
    } else {
      return this.augury.root.pipe(
        first(),
        map(root => root.create('prx:flight-allocation-preview', {}, { ...flight, startAt, endAt, totalGoal, dailyMinimum })),
        mergeMap(flightPreviewDoc => flightPreviewDoc.followList('prx:flight-days'))
      );
    }
  }
}
