import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MockHalService, MockHalDoc } from 'ngx-prx-styleguide';
import { AdvertiserModel } from '../../shared/model/advertiser.model';

@Injectable()
export class AdvertiserServiceMock {
  constructor(private augury: MockHalService) {}

  loadAdvertisers() {}

  get advertisers(): Observable<AdvertiserModel[]> {
    return of([
      new AdvertiserModel(this.augury.root, new MockHalDoc({
          id: 1,
          name: 'Adidas'
      })),
      new AdvertiserModel(this.augury.root, new MockHalDoc({
          id: 2,
          name: 'Griddy'
      })),
      new AdvertiserModel(this.augury.root, new MockHalDoc({
          id: 3,
          name: 'Toyota'
      }))
    ]);
  }

  findAdvertiserById(id: number): Observable<AdvertiserModel> {
    return this.advertisers.pipe(
      map(advertisers => {
        return advertisers.find(a => a.id === id) || new AdvertiserModel(this.augury.root, null, false);
      })
    );
  }

  save(): Observable<{}> {
    return of();
  }
}
