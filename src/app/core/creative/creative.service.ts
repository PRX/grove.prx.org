import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
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
    direction?: 'desc' | 'asc' | '';
  }): Observable<HalDoc[]> {
    return this.augury.followItems('prx:creatives', {
      ...params,
      sorts: `${params.sorts}:${params.direction}`,
      ...(params.text && { filters: `text:${params.text}` })
    });
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
