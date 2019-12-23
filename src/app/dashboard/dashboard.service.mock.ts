import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MockHalService } from 'ngx-prx-styleguide';
import { Campaign, Flight, Facets, DashboardParams, DashboardRouteParams } from './dashboard.service';

export const flights: Flight[] = [
  {
    id: 1,
    name: 'Flight 1',
    startAt: new Date('2019-09-01 0:0:0'),
    endAt: new Date('2019-09-10 0:0:0'),
    zones: ['Preroll', 'Midroll'],
    targets: [
      { id: 1, label: 'LAN' },
      { id: 2, label: 'SAD' },
      { id: 3, label: 'CA' },
      { id: 4, label: 'NYC' },
      { id: 5, label: 'NY' },
      { id: 6, label: 'CHI' },
      { id: 7, label: 'IL' }
    ]
  },
  {
    id: 2,
    name: 'Flight 2',
    startAt: new Date('2019-09-02 0:0:0'),
    endAt: new Date('2019-09-13 0:0:0'),
    zones: ['Midroll', 'Preroll'],
    targets: [{ id: 1, label: 'Global' }]
  }
];

export const campaigns: Campaign[] = [
  {
    id: 1,
    accountId: 2,
    name: 'New Campaign',
    advertiser: { id: 1, label: 'Adidas' },
    status: 'canceled',
    type: 'paid_campaign',
    repName: 'John',
    notes: '',
    flights,
    loading: false
  },
  {
    id: 2,
    accountId: 2,
    name: 'Another Campaign',
    advertiser: { id: 2, label: 'Griddy' },
    status: 'approved',
    type: 'paid_campaign',
    repName: 'Jacob',
    notes: '',
    flights,
    loading: false
  },
  {
    id: 3,
    accountId: 2,
    name: 'Third Campaign',
    advertiser: { id: 3, label: 'Toyota' },
    status: 'sold',
    type: 'house',
    repName: 'Jingleheimer',
    notes: '',
    flights,
    loading: false
  }
];

export const facets: Facets = {
  advertiser: [
    { id: 3, label: 'Toyota' },
    { id: 2, label: 'Griddy' },
    { id: 1, label: 'Adidas' }
  ],
  podcast: [
    { id: 3, label: 'Podcast 3' },
    { id: 2, label: 'Podcast 2' },
    { id: 1, label: 'Podcast 1' }
  ],
  status: [
    { id: 'canceled', label: 'Canceled' },
    { id: 'approved', label: 'Approved' },
    { id: 'sold', label: 'Sold' }
  ],
  type: [
    { id: 'house', label: 'House' },
    { id: 'paid_campaign', label: 'Paid Campaign' }
  ],
  geo: [
    { id: 'US', label: 'United States' },
    { id: 'CA', label: 'Canada' }
  ],
  zone: [
    { id: 'mid_1', label: 'Midroll' },
    { id: 'pre_1', label: 'Preroll' }
  ]
};

export const params: DashboardParams = {
  view: 'flights',
  page: 1,
  per: 2,
  advertiser: 2,
  podcast: 2,
  status: 'approved',
  type: 'paid_campaign',
  geo: ['US', 'CA'],
  zone: ['mid_1', 'pre_1'],
  text: 'anything',
  representative: 'Schmidt',
  before: new Date('2019-09-30'),
  after: new Date('2019-09-01'),
  desc: false
};

@Injectable()
export class DashboardServiceMock {
  params = { page: 1, per: 9 };

  constructor(private augury: MockHalService) {}

  loadCampaignList(newParams: DashboardParams) {
    this.params = { ...newParams, per: this.params.per, page: (newParams && newParams.page) || 1 };
  }

  get campaigns(): Observable<Campaign[]> {
    return of(campaigns);
  }

  get loadedCampaigns(): Observable<Campaign[]> {
    return of(campaigns.filter(c => !c.loading));
  }

  getRouteQueryParams(partialParams: DashboardParams): DashboardRouteParams {
    const omitPer = allParams => {
      const { per, ...theRest } = allParams;
      return theRest;
    };
    return { ...omitPer(params), ...omitPer(partialParams), geo: 'US|CA', zone: 'mid_1|pre_1', before: '2019-09-30', after: '2019-09-01' };
  }
}