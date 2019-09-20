import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { withLatestFrom, map, mergeMap, share } from 'rxjs/operators';
import { AuguryService } from '../core/augury.service';
import { HalDoc } from 'ngx-prx-styleguide';

@Injectable()
export class AdvertiserService {
  // tslint:disable-next-line: variable-name
  private _advertisers = new BehaviorSubject({});

  constructor(private auguryService: AuguryService) {
    this.loadAdvertisers();
  }

  get advertisers(): Observable<{name: string, value: string}[]> {
    return this._advertisers.pipe(
      map(advertisers => {
        return Object.keys(advertisers)
          .map(id => advertisers[id])
          // hmm, sort?
          .sort((a, b) => a.name.localeCompare(b.name));
      })
    );
  }

  loadAdvertisers() {
    this.auguryService.followItems(`prx:advertisers`, {per: 999}).pipe(
      map((docs: HalDoc[]) => {
        return docs.reduce((acc, doc: HalDoc) => {
          acc[doc.id] = {
            name: doc['name'],
            value: doc.expand('self')
          };
          return acc;
        }, {});
      })
    ).subscribe(advertisers => {
      this._advertisers.next(advertisers);
    });
  }

  addAdvertiser(name: string): Observable<{id: number, name: string, set_advertiser_uri: string}> {
    const post = this.auguryService.root.pipe(
      mergeMap(root => {
        return root.create('prx:advertiser', {}, {name}).pipe(share());
      }),
      share(), // double up on share or it's duplicating the post for some reason?
      map((doc: HalDoc): {id: number, name: string, set_advertiser_uri: string} => {
        const { id } = doc;
        // tslint:disable-next-line: variable-name
        const set_advertiser_uri = doc.expand('self');
        return {id, name,  set_advertiser_uri};
      })
    );

    // TODO: seems like still duplicating the post

    post.pipe(
      withLatestFrom(this._advertisers)
    ).subscribe(([newAdvertiser, advertisers] ) => {
      const { id, set_advertiser_uri } = newAdvertiser;
      this._advertisers.next({
        ...advertisers,
        [id]: {name,  set_advertiser_uri}
      });
    });

    return post;
  }
}
