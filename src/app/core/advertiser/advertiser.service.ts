import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, withLatestFrom, map, mergeMap, share, publish, refCount } from 'rxjs/operators';
import { AuguryService } from '../augury.service';
import { HalDoc } from 'ngx-prx-styleguide';

export interface Advertiser {
  id: number;
  name: string;
  set_advertiser_uri: string;
}

@Injectable()
export class AdvertiserService {
  // tslint:disable-next-line: variable-name
  private _advertisers = new BehaviorSubject<{[id: number]: Advertiser}>({});

  constructor(private auguryService: AuguryService) {}

  get advertisers(): Observable<Advertiser[]> {
    return this._advertisers.pipe(
      map(advertisers => {
        return Object.keys(advertisers)
          .map(id => advertisers[id])
          .sort((a, b) => a.name.localeCompare(b.name));
      })
    );
  }

  loadAdvertisers(): Observable<null> {
    const result = this.auguryService.followItems(`prx:advertisers`, {per: 999}).pipe(
      map((docs: HalDoc[]) => {
        return docs.reduce((acc, doc: HalDoc): {[id: number]: Advertiser} => {
          return {
            ...acc,
            [doc.id]: {
              id: doc.id,
              name: doc['name'],
              set_advertiser_uri: doc.expand('self')
            }
          };
        }, {});
      }),
      share()
    );

    result.subscribe((advertisers: {[id: number]: Advertiser}) => {
      this._advertisers.next(advertisers);
    });

    return result.pipe(map(() => null));
  }

  findAdvertiserByUri(uri: string): Observable<Advertiser> | undefined {
    return this.advertisers.pipe(
      map((advertisers: Advertiser[]) => advertisers.find(advertiser => advertiser.set_advertiser_uri === uri))
    );
  }

  addAdvertiser(name: string): Observable<{id: number, name: string, set_advertiser_uri: string}> {
    const post = this.auguryService.root.pipe(
      mergeMap(root => {
        return root.create('prx:advertiser', {}, {name});
      }),
      // publish + refCount multicasts the Observable (makes it hot/shareable) and gives a complete notification to any late subscribers
      // unlike share which uses a subject factory so late subscribers cause a retry (duplicating the HTTP POST)
      publish(),
      refCount(),
      map((doc: HalDoc): {id: number, name: string, set_advertiser_uri: string} => {
        const { id } = doc;
        // tslint:disable-next-line: variable-name
        const set_advertiser_uri = doc.expand('self');
        return {id, name,  set_advertiser_uri};
      })
    );

    post.pipe(
      withLatestFrom(this._advertisers)
    ).subscribe(([newAdvertiser, advertisers] ) => {
      const { id, set_advertiser_uri } = newAdvertiser;
      this._advertisers.next({
        ...advertisers,
        [id]: {id, name, set_advertiser_uri}
      });
    });

    return post;
  }
}
