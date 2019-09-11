import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';

export interface Advertiser {
  id: number;
  name: string;
  self_uri: string;
}

describe('something', () => {});

@Injectable()
export class AdvertiserService {
  constructor(private augury: AuguryService) {}

  listAdvertisers(params = {}): Observable<Advertiser[]> {
    return this.augury.followItems('prx:advertisers', params).pipe(map(docs => this.docsToAdvertisers(docs)));
  }

  docsToAdvertisers(docs: HalDoc[]): Advertiser[] {
    return docs.map(this.docToAdvertiser);
  }

  docToAdvertiser(doc: HalDoc): Advertiser {
    return {
      id: doc.id,
      name: doc['name'],
      self_uri: doc.expand('self')
    };
  }
}
