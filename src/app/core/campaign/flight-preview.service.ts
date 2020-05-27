import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { mergeMap, first } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

@Injectable()
export class FlightPreviewService {
  constructor(private augury: AuguryService) {}

  createFlightPreview(
    flight: {},
    flightDoc?: HalDoc,
    campaignDoc?: HalDoc
  ): Observable<{ status: string; statusMessage: string; days: HalDoc[] }> {
    if (flightDoc) {
      return this.preview(flight, flightDoc, 'preview');
    } else if (campaignDoc) {
      return this.preview(flight, campaignDoc, 'prx:flight-allocation-preview');
    } else {
      return this.augury.root.pipe(
        first(),
        mergeMap(root => this.preview(flight, root, 'prx:flight-allocation-preview'))
      );
    }
  }

  private preview(flight: {}, doc: HalDoc, link: string) {
    return doc.create(link, {}, flight).pipe(
      mergeMap((flightPreviewDoc: HalDoc) => {
        return forkJoin({
          status: of(flightPreviewDoc['status']),
          statusMessage: of(flightPreviewDoc['statusMessage']),
          days: flightPreviewDoc.followList('prx:flight-days')
        });
      })
    );
  }
}
