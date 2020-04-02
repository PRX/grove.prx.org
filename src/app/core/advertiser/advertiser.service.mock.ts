import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MockHalService } from 'ngx-prx-styleguide';
import { Advertiser } from './advertiser-state.service';

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

  loadAdvertisers(): Observable<null> {
    return of(null);
  }

  get advertisers(): Observable<Advertiser[]> {
    return this._advertisers.asObservable();
  }

  addAdvertiser(name): Observable<Advertiser> {
    const id = advertisers.length + 1;
    const advertiser = { name, set_advertiser_uri: id.toString(), id };
    this._advertisers.next([...this._advertisers.getValue(), advertiser]);
    return of(advertiser);
  }
}
