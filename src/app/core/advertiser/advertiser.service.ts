import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { withLatestFrom, map, mergeMap, share } from 'rxjs/operators';
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

  constructor(private auguryService: AuguryService) {
    this.loadAdvertisers();
  }

  get advertisers(): Observable<Advertiser[]> {
    return this._advertisers.pipe(
      map(advertisers => {
        return Object.keys(advertisers)
          .map(id => advertisers[id])
          .sort((a, b) => a.name.localeCompare(b.name));
      })
    );
  }

  loadAdvertisers() {
    this.auguryService.followItems(`prx:advertisers`, {per: 999}).pipe(
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
      })
    ).subscribe((advertisers: {[id: number]: Advertiser}) => {
      this._advertisers.next(advertisers);
    });
  }

  findAdvertiserByUri(uri: string): Observable<Advertiser> | undefined {
    return this.advertisers.pipe(
      map((advertisers: Advertiser[]) => advertisers.find(advertiser => advertiser.set_advertiser_uri === uri))
    );
  }

  addAdvertiser(name: string): Observable<{id: number, name: string, set_advertiser_uri: string}> {
    const post = this.auguryService.root.pipe(
      mergeMap(root => {
        return root.create('prx:advertiser', {}, {name}).pipe(share());
      }),
      share(), // HAS TO double up on share or it's duplicating the post for some reason?
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
