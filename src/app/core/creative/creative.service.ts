import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { Creative } from '../../campaign/store/models';

@Injectable()
export class CreativeService {
  constructor(private augury: AuguryService) {}

  loadCreative(id: number): Observable<HalDoc> {
    return this.augury.follow('prx:creative', { id });
  }

  loadCreativeList(params: {
    page?: number;
    per?: number;
    text?: string;
    sorts?: string;
    direction?: string;
  }): Observable<{ creativeDoc: HalDoc; advertiserDoc: HalDoc }[]> {
    return this.augury
      .followItems('prx:creatives', {
        ...params,
        zoom: 'prx:advertiser',
        sorts: `${params.sorts}:${params.direction}`,
        ...(params.text && { filters: `text:${params.text}` })
      })
      .pipe(
        mergeMap((creativeDocs: HalDoc[]) =>
          forkJoin(
            creativeDocs.map(creativeDoc =>
              creativeDoc.follow('prx:advertiser').pipe(map(advertiserDoc => ({ creativeDoc, advertiserDoc })))
            )
          )
        )
      );
  }

  updateCreative(doc: HalDoc, creative: Creative): Observable<HalDoc> {
    return doc.update(creative);
  }

  createCreative(creative: Creative): Observable<HalDoc> {
    return this.augury.root.pipe(mergeMap(rootDoc => rootDoc.create('prx:creative', {}, creative)));
  }

  deleteCreative(doc: HalDoc): Observable<HalDoc> {
    return doc.destroy();
  }
}
