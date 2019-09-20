import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MockHalService } from 'ngx-prx-styleguide';

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
  constructor(private augury: MockHalService) {}

  loadAdvertisers() {}

  get advertisers(): Observable<{id: number, name: string, set_advertiser_uri: string}[]> {
    return of(advertisers);
  }

  addAdvertiser(name): Observable<{id: number, name: string, set_advertiser_uri: string}> {
    return of({name, set_advertiser_uri: '4', id: 4});
  }
}
