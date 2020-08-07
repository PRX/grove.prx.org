import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { MockHalService } from 'ngx-prx-styleguide';
import { Campaign, Flight, Facets, DashboardParams, DashboardRouteParams } from './dashboard.service';

export const flights: Flight[] = [
  {
    id: 1,
    name: 'Flight 1',
    allocationStatus: 'ok',
    allocationStatusOk: true,
    startAt: new Date('2019-09-01 0:0:0'),
    endAt: new Date('2019-09-10 0:0:0'),
    totalGoal: 1234,
    zones: ['Preroll', 'Midroll'],
    targets: [
      { type: 'country', code: 'CA', label: 'Canada' },
      { type: 'country', code: 'US', label: 'United States of America' },
      { type: 'metro', code: '1', label: 'LAN' },
      { type: 'metro', code: '2', label: 'SAD' },
      { type: 'metro', code: '3', label: 'NYC' },
      { type: 'metro', code: '4', label: 'CHI' },
      { type: 'subdiv', code: 'IN', label: 'Indiana' },
      { type: 'episode', code: '22222222-2222-2222-2222-222222222222', label: '22222222-2222-2222-2222-222222222222' }
    ]
  },
  {
    id: 2,
    name: 'Flight 2',
    allocationStatus: 'error',
    allocationStatusOk: false,
    startAt: new Date('2019-09-02 0:0:0'),
    endAt: new Date('2019-09-13 0:0:0'),
    totalGoal: 54321,
    zones: ['Midroll', 'Preroll'],
    targets: [{ type: 'country', code: '5', label: 'US' }]
  }
];

export const campaigns: Campaign[] = [
  {
    id: 1,
    accountId: 2,
    name: 'New Campaign',
    advertiser: { id: 1, label: 'Adidas' },
    status: 'canceled',
    type: 'paid',
    repName: 'John',
    notes: '',
    flights,
    loading: false,
    actualCount: 10000,
    totalGoal: 100000
  },
  {
    id: 2,
    accountId: 2,
    name: 'Another Campaign',
    advertiser: { id: 2, label: 'Griddy' },
    status: 'approved',
    type: 'paid',
    repName: 'Jacob',
    notes: '',
    flights,
    loading: false,
    actualCount: 60000,
    totalGoal: 100000
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
    loading: false,
    actualCount: 125000,
    totalGoal: 100000
  }
];

flights.forEach(flight => (flight.parent = campaigns[0]));

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
    { id: 'paid', label: 'Paid' }
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
  type: 'paid',
  geo: ['US', 'CA'],
  zone: ['mid_1', 'pre_1'],
  text: 'anything',
  representative: 'Schmidt',
  before: new Date('2019-09-30'),
  after: new Date('2019-09-01'),
  direction: 'asc'
};

@Injectable()
export class DashboardServiceMock {
  // tslint:disable-next-line: variable-name
  _params: BehaviorSubject<DashboardParams> = new BehaviorSubject({ page: 1, per: 9 });
  get params(): Observable<DashboardParams> {
    return this._params.asObservable();
  }

  constructor(private augury: MockHalService) {}

  get campaigns(): Observable<Campaign[]> {
    return of(campaigns);
  }

  get loadedCampaigns(): Observable<Campaign[]> {
    return of(campaigns.filter(c => !c.loading));
  }

  get flights(): Observable<Flight[]> {
    return of(flights);
  }

  get campaignFacets(): Observable<Facets> {
    return of(facets);
  }

  get flightFacets(): Observable<Facets> {
    return of(facets);
  }

  getRouteQueryParams(partialParams: DashboardParams): Observable<DashboardRouteParams> {
    const withoutView = (p: DashboardParams) => {
      const { view, ...rest } = p;
      return rest;
    };
    return this.params.pipe(
      map(existingParams => {
        return {
          ...withoutView(existingParams),
          ...withoutView(partialParams),
          geo: 'US|CA',
          zone: 'mid_1|pre_1',
          before: '2019-09-30',
          after: '2019-09-01'
        };
      })
    );
  }

  getRouteParams(partialParams: DashboardParams): Observable<DashboardRouteParams> {
    return this.params.pipe(
      map(existingParams => {
        return {
          ...existingParams,
          ...partialParams,
          geo: 'US|CA',
          zone: 'mid_1|pre_1',
          before: '2019-09-30',
          after: '2019-09-01'
        };
      })
    );
  }

  setParamsFromRoute(routeParams: DashboardParams, view: 'flights' | 'campaigns') {
    this.params.pipe(first()).subscribe(existingParams => {
      this._params.next({ ...existingParams, ...routeParams, view });
    });
  }

  routeToParams(partialParams: DashboardParams) {
    this.params.pipe(first()).subscribe(existingParams => {
      this._params.next({ ...existingParams, ...partialParams });
    });
  }
}
