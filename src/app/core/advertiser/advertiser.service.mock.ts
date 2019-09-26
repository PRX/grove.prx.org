import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MockHalService } from 'ngx-prx-styleguide';
import { Advertiser } from './advertiser.service';

export const advertisers = [
  {
      id: 1,
      set_advertiser_uri: '1',
      name: 'Adidas'
  },
  {
      id: 2,
      set_advertiser_uri: '2',
      name: 'Griddy'
  },
  {
      id: 3,
      set_advertiser_uri: '3',
      name: 'Toyota'
  }
];

@Injectable()
export class AdvertiserServiceMock {
  // tslint:disable-next-line: variable-name
  _advertisers = new BehaviorSubject(advertisers);

  constructor(private augury: MockHalService) {}

  loadAdvertisers() {}

  get advertisers(): Observable<Advertiser[]> {
    return this._advertisers.asObservable();
  }

  addAdvertiser(name): Observable<Advertiser> {
    const advertiser = {name, set_advertiser_uri: '4', id: 4};
    this._advertisers.next([...this._advertisers.getValue(), advertiser]);
    return of(advertiser);
  }
}
