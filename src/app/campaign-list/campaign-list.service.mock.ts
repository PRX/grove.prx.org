import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MockHalService } from 'ngx-prx-styleguide';
import { Campaign, Flight } from './campaign-list.service';

export const flights: Flight[] = [
  {
    name: 'Flight 1',
    startAt: new Date('2019-09-01 0:0:0'),
    endAt: new Date('2019-09-10 0:0:0'),
    zones: ['Preroll'],
    targets: [
      {id: 1, label: 'LAN'},
      {id: 2, label: 'SAD'},
      {id: 3, label: 'CA'},
      {id: 4, label: 'NYC'},
      {id: 5, label: 'NY'},
      {id: 6, label: 'CHI'},
      {id: 7, label: 'IL'}
    ]
  },
  {
    name: 'Flight 2',
    startAt: new Date('2019-09-02 0:0:0'),
    endAt: new Date('2019-09-13 0:0:0'),
    zones: ['Midroll'],
    targets: [
      {id: 1, label: 'Global'}
    ]
  }
];

export const campaigns = [
  {
    id: 1,
    accountId: 2,
    name: 'New Campaign',
    advertiser: {id: 1, label: 'Adidas'},
    status: 'canceled',
    type: 'paid_campaign',
    repName: 'John',
    notes: '',
    flights
  },
  {
    id: 2,
    accountId: 2,
    name: 'Another Campaign',
    advertiser: {id: 2, label: 'Griddy'},
    status: 'approved',
    type: 'paid_campaign',
    repName: 'Jacob',
    notes: '',
    flights
  },
  {
    id: 3,
    accountId: 2,
    name: 'Third Campaign',
    advertiser: {id: 3, label: 'Toyota'},
    status: 'sold',
    type: 'house',
    repName: 'Jingleheimer',
    notes: '',
    flights
  }
];

@Injectable()
export class CampaignListServiceMock {
  params = {page: 1, per: 9};

  constructor(private augury: MockHalService) {}

  loadCampaignList() {}

  get campaigns(): Observable<Campaign[]> {
    return of(campaigns);
  }
}
