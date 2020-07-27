import { Injectable } from '@angular/core';
import { Router, Params } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { switchMap, concatAll, withLatestFrom, map, first, finalize } from 'rxjs/operators';
import { utc } from 'moment';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';

interface KeyValue {
  id: number | string;
  label: string;
}

export type Advertiser = KeyValue;
export type Facet = KeyValue;

export interface Target {
  type: string;
  code: string;
  label: string;
  exclude?: boolean;
}

export interface DashboardParams {
  view?: 'flights' | 'campaigns';
  page?: number;
  per?: number;
  advertiser?: number;
  podcast?: number;
  status?: string;
  type?: string;
  geo?: string[];
  zone?: string[];
  text?: string;
  representative?: string;
  before?: Date;
  after?: Date;
  sort?: string;
  direction?: 'desc' | 'asc' | '';
}

export interface DashboardRouteParams extends Omit<DashboardParams, 'geo' | 'zone' | 'before' | 'after'> {
  geo?: string;
  zone?: string;
  before?: string;
  after?: string;
}

export interface Facets {
  advertiser?: Facet[];
  podcast?: Facet[];
  status?: Facet[];
  type?: Facet[];
  geo?: Facet[];
  zone?: Facet[];
}

export interface Flight {
  id: number;
  name: string;
  status: string;
  statusOk: boolean;
  startAt: Date;
  endAt: Date;
  zones: string[];
  totalGoal?: number;
  targets?: Target[];
  podcast?: string;
  parent?: Campaign;
  actualCount?: number;
}

export interface Campaign {
  id: number;
  accountId: number;
  name: string;
  advertiser?: Advertiser;
  type: string;
  status: string;
  repName: string;
  notes: string;
  flights?: Flight[];
  loading?: boolean;
  totalGoal?: number;
  actualCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // tslint:disable-next-line: variable-name
  private _campaignFacets = new BehaviorSubject<Facets>({});
  // tslint:disable-next-line: variable-name
  private _flightFacets = new BehaviorSubject<Facets>({});
  campaignTotal: number;
  campaignCount: number;
  flightTotal: number;
  flightCount: number;
  // tslint:disable-next-line: variable-name
  private _error = new BehaviorSubject<Error>(null);
  // tslint:disable-next-line: variable-name
  private _params = new BehaviorSubject<DashboardParams>({ page: 1, view: 'flights' });
  // tslint:disable-next-line: variable-name
  private _campaigns = new BehaviorSubject<{ [id: number]: Campaign }>({});
  // tslint:disable-next-line: variable-name
  private _currentCampaignIds: number[]; // campaign ids for current request/filter params
  // tslint:disable-next-line: variable-name
  private _campaignsLoading = new BehaviorSubject<boolean>(false);
  // tslint:disable-next-line: variable-name
  private _flights = new BehaviorSubject<{ [id: number]: Flight }>({});
  // tslint:disable-next-line: variable-name
  private _currentFlightIds: number[]; // flight ids for current request/filter params
  // tslint:disable-next-line: variable-name
  private _flightsLoading = new BehaviorSubject<boolean>(false);

  constructor(private augury: AuguryService, private router: Router) {}

  get error(): Observable<Error> {
    return this._error.asObservable();
  }

  get params(): Observable<DashboardParams> {
    return this._params.asObservable();
  }

  get campaignLoading(): Observable<boolean[]> {
    return this.campaigns.pipe(map(campaigns => campaigns && campaigns.filter(c => c.loading).map(c => c.loading)));
  }

  get campaignsLoading(): Observable<boolean> {
    return this._campaignsLoading.asObservable();
  }

  get flightsLoading(): Observable<boolean> {
    return this._flightsLoading.asObservable();
  }

  get campaigns(): Observable<Campaign[]> {
    // this._campaigns is a subject of campaign entities (an object with campaignIds mapped to campaign,) convert to array for display
    return this._campaigns.asObservable().pipe(
      map((campaignEntities: {}) => {
        if (this._currentCampaignIds && this._currentCampaignIds.length) {
          return (
            this._currentCampaignIds
              // map from array of Ids
              .filter(campaignId => campaignEntities[campaignId])
              .map(campaignId => campaignEntities[campaignId])
          );
        }
      })
    );
  }

  get loadedCampaigns(): Observable<Campaign[]> {
    return this.campaigns.pipe(map((campaigns: Campaign[]) => campaigns && campaigns.filter(c => !c.loading)));
  }

  get flights(): Observable<Flight[]> {
    return this._flights.pipe(
      map((flightEntites: {}) => {
        if (this._currentFlightIds && this._currentFlightIds.length) {
          return (
            this._currentFlightIds
              // map from array of Ids
              .filter(flightId => flightEntites[flightId])
              .map(flightId => flightEntites[flightId])
          );
        }
      }),
      map(flights => flights || [])
    );
  }

  get actualsTotal(): Observable<number> {
    return this.flights.pipe(map((flights: Flight[]) => flights.reduce((acc, { actualCount }: Flight) => acc + actualCount, 0)));
  }

  get goalsTotal(): Observable<number> {
    return this.flights.pipe(map((flights: Flight[]) => flights.reduce((acc, { totalGoal }: Flight) => acc + totalGoal, 0)));
  }

  get campaignFacets(): Observable<Facets> {
    return this._campaignFacets.asObservable();
  }

  get flightFacets(): Observable<Facets> {
    return this._flightFacets.asObservable();
  }

  loadCampaignList(params?: DashboardParams) {
    this.campaignCount = null;
    this._campaignsLoading.next(true);
    this._error.next(null);
    this.loadList('prx:campaigns', 'prx:flights,prx:advertiser', { ...params, per: 12, sort: 'flight_start_at' })
      .pipe(
        switchMap(([{ count, total, facets }, campaignDocs]) => {
          this._campaignFacets.next(facets);
          this.campaignTotal = total;
          this.campaignCount = count;
          this._campaigns.next(
            campaignDocs.reduce((acc, doc) => {
              return { ...acc, [doc.id]: { loading: true } };
            }, {})
          );
          // campaigns state is mapped from a list of ids from the current request/filter params
          this._currentCampaignIds = campaignDocs.map(c => c['id']);
          return campaignDocs.map(doc => {
            return combineLatest([of(doc), doc.follow('prx:advertiser'), doc.followItems('prx:flights')]);
          });
        }),
        concatAll(),
        withLatestFrom(this._campaigns, this._campaignFacets),
        finalize(() => this._campaignsLoading.next(false))
      )
      .subscribe(
        ([[campaignDoc, advertiserDoc, flightDocs], campaigns, campaignFacets]: [
          [HalDoc, HalDoc, HalDoc[]],
          { [id: number]: Campaign },
          Facets
        ]) => {
          const campaign: Campaign = {
            id: campaignDoc['id'],
            ...(campaignDoc['_links'] &&
              campaignDoc['_links']['prx:account'] && {
                accountId: parseInt(campaignDoc['_links']['prx:account']['href'].split('/').pop(), 10)
              }),
            name: campaignDoc['name'],
            type: campaignDoc['type'],
            status: campaignDoc['status'],
            repName: campaignDoc['repName'],
            notes: campaignDoc['notes'],
            actualCount: campaignDoc['actualCount'],
            totalGoal: campaignDoc['totalGoal'],
            loading: false,
            advertiser: { id: advertiserDoc['id'], label: advertiserDoc['name'] },
            flights: flightDocs.map(doc => ({
              id: doc['id'],
              name: doc['name'],
              status: doc['status'],
              statusOk: doc['status'] === 'ok',
              startAt: doc['startAt'] && new Date(doc['startAt']),
              endAt:
                doc['endAt'] &&
                utc(doc['endAt'])
                  .subtract(1, 'days')
                  .toDate(),
              // map zonesId from facets
              zones: doc['zones'].map(zoneId => {
                const zoneFacet = campaignFacets && campaignFacets.zone && campaignFacets.zone.find(facet => facet.id === zoneId);
                return (zoneFacet && zoneFacet.label) || zoneId;
              }),
              actualCount: doc['actualCount'],
              targets: doc['targets']
            }))
          };

          // set _campaigns[campaign.id]
          this._campaigns.next({
            ...campaigns,
            [campaign.id]: campaign
          });
        },
        err => this._error.next(err)
      );
  }

  loadFlightList(params?: DashboardParams) {
    this.flightCount = null;
    this._flightsLoading.next(true);
    this._error.next(null);
    this.loadList('prx:flights', 'prx:campaign,prx:advertiser', {
      ...params,
      per: (params && params.per) || 25,
      sort: (params && params.sort) || 'start_at',
      direction: (params && params.direction) || 'desc'
    })
      .pipe(
        switchMap(([{ count, total, facets }, flightDocs]) => {
          this._flightFacets.next(facets);
          this.flightTotal = total;
          this.flightCount = count;
          this._currentFlightIds = flightDocs.map(c => c['id']);
          return flightDocs.map(doc => combineLatest([of(doc), doc.follow('prx:campaign'), doc.follow('prx:advertiser')]));
        }),
        concatAll(),
        withLatestFrom(this._flights, this._flightFacets),
        finalize(() => this._flightsLoading.next(false))
      )
      .subscribe(
        ([[flightDoc, campaignDoc, advertiserDoc], flights, flightFacets]: [
          [HalDoc, HalDoc, HalDoc],
          { [id: number]: Flight },
          Facets
        ]) => {
          const flight: Flight = {
            id: flightDoc['id'],
            name: flightDoc['name'],
            status: flightDoc['status'],
            statusOk: flightDoc['status'] === 'ok',
            startAt: flightDoc['startAt'] && new Date(flightDoc['startAt']),
            endAt:
              flightDoc['endAt'] &&
              utc(flightDoc['endAt'])
                .subtract(1, 'days')
                .toDate(),
            actualCount: flightDoc['actualCount'],
            totalGoal: flightDoc['totalGoal'] || 0,
            // map zonesId from facets
            zones: flightDoc['zones'].map(zoneId => {
              const zoneFacet = flightFacets && flightFacets.zone && flightFacets.zone.find(facet => facet.id === zoneId);
              return (zoneFacet && zoneFacet.label) || zoneId;
            }),
            targets: flightDoc['targets'],
            ...(flightDoc['_links'] &&
              flightDoc['_links']['prx:inventory'] &&
              flightDoc['_links']['prx:inventory']['title'] && {
                podcast: flightDoc['_links']['prx:inventory']['title']
              }),
            parent: {
              id: campaignDoc['id'],
              ...(campaignDoc['_links'] &&
                campaignDoc['_links']['prx:account'] && {
                  accountId: parseInt(campaignDoc['_links']['prx:account']['href'].split('/').pop(), 10)
                }),
              name: campaignDoc['name'],
              type: campaignDoc['type'],
              status: campaignDoc['status'],
              repName: campaignDoc['repName'],
              notes: campaignDoc['notes'],
              advertiser: { id: advertiserDoc['id'], label: advertiserDoc['name'] }
            }
          };

          // set _flights[flight.id]
          this._flights.next({
            ...flights,
            [flight.id]: flight
          });
        },
        err => this._error.next(err)
      );
  }

  loadList(list: string, zoom: string, params?: DashboardParams): Observable<[{ count: number; total: number; facets: Facets }, HalDoc[]]> {
    const { page, per, sort, direction } = params;
    const filters = this.getFilters(params);

    return this.augury
      .follow(list, {
        page,
        per,
        zoom,
        ...(filters && { filters }),
        ...(sort && { sorts: sort + ':' + (direction || 'asc') })
      })
      .pipe(
        switchMap(result => {
          return combineLatest([
            of({ count: +result['count'], total: +result['total'], facets: result['facets'] }),
            result.followList('prx:items')
          ]);
        })
      );
  }

  getFilters(params: DashboardParams) {
    let filters = '';
    if (params.advertiser) {
      filters += `advertiser=${params.advertiser}`;
    }
    if (params.podcast) {
      filters += `${filters ? ',' : ''}podcast=${params.podcast}`;
    }
    if (params.status) {
      if (params.view === 'campaigns') {
        filters += `${filters ? ',' : ''}status=${params.status}`;
      } else if (params.view === 'flights') {
        filters += `${filters ? ',' : ''}campaign_status=${params.status}`;
      }
    }
    if (params.type) {
      if (params.view === 'campaigns') {
        filters += `${filters ? ',' : ''}type=${params.type}`;
      } else if (params.view === 'flights') {
        filters += `${filters ? ',' : ''}campaign_type=${params.type}`;
      }
    }
    if (params.geo && params.geo.length) {
      filters += `${filters ? ',' : ''}geo=${params.geo.join(',')}`;
    }
    if (params.zone && params.zone.length) {
      filters += `${filters ? ',' : ''}zone=${params.zone.join(',')}`;
    }
    if (params.text) {
      filters += `${filters ? ',' : ''}text=${params.text}`;
    }
    if (params.representative) {
      if (params.view === 'campaigns') {
        filters += `${filters ? ',' : ''}representative=${params.representative}`;
      } else if (params.view === 'flights') {
        filters += `${filters ? ',' : ''}campaign_representative=${params.representative}`;
      }
    }
    if (params.before) {
      filters += `${filters ? ',' : ''}before=${params.before.toISOString()}`;
    }
    if (params.after) {
      filters += `${filters ? ',' : ''}after=${params.after.toISOString()}`;
    }
    return filters;
  }

  getRouteQueryParams(partialParams: DashboardParams): Observable<DashboardRouteParams> {
    return this.getRouteParams(partialParams).pipe(
      map(params => {
        // view is in url, not a queryParam
        const { view, ...queryParams } = params;
        return queryParams;
      })
    );
  }

  getRouteParams(partialParams: DashboardParams): Observable<DashboardRouteParams> {
    let { view, page, per, advertiser, podcast, status, type, text, representative, sort, direction } = partialParams;

    return this.params.pipe(
      map(params => {
        // this function takes partial parameters (what changed)
        // then mixed in the existing this.params unless property was explicitly set in partialParams
        // partialParams can explicitly clear properties/set to undefined, so check hasOwnProperty
        if (!partialParams.hasOwnProperty('view') && params.view) {
          view = params.view;
        }
        if (!partialParams.hasOwnProperty('page') && params.page) {
          page = params.page;
        }
        if (!partialParams.hasOwnProperty('per') && params.per) {
          per = params.per;
        }
        if (!partialParams.hasOwnProperty('advertiser') && params.advertiser) {
          advertiser = params.advertiser;
        }
        if (!partialParams.hasOwnProperty('podcast') && params.podcast) {
          podcast = params.podcast;
        }
        if (!partialParams.hasOwnProperty('status') && params.status) {
          status = params.status;
        }
        if (!partialParams.hasOwnProperty('type') && params.type) {
          type = params.type;
        }
        if (!partialParams.hasOwnProperty('text') && params.text) {
          text = params.text;
        }
        if (!partialParams.hasOwnProperty('representative') && params.representative) {
          representative = params.representative;
        }
        if (!partialParams.hasOwnProperty('sort') && params.hasOwnProperty('sort')) {
          sort = params.sort;
        }
        if (!partialParams.hasOwnProperty('direction') && params.hasOwnProperty('direction')) {
          direction = params.direction;
        }
        let before: string;
        let after: string;
        if (partialParams.before) {
          before = partialParams.before.toISOString();
        } else if (!partialParams.hasOwnProperty('before') && params.before) {
          before = params.before.toISOString();
        }
        if (partialParams.after) {
          after = partialParams.after.toISOString();
        } else if (!partialParams.hasOwnProperty('after') && params.after) {
          after = params.after.toISOString();
        }
        let geo;
        if (partialParams.geo) {
          geo = partialParams.geo.join('|');
        } else if (params.geo) {
          geo = params.geo.join('|');
        }
        let zone: string;
        if (partialParams.zone) {
          zone = partialParams.zone.join('|');
        } else if (params.zone) {
          zone = params.zone.join('|');
        }
        // properties that are undefined/falsey do not appear in the route
        return {
          ...(view && { view }),
          ...(page && { page }),
          ...(per && { per }),
          ...(advertiser && { advertiser }),
          ...(podcast && { podcast }),
          ...(status && { status }),
          ...(type && { type }),
          ...(geo && { geo }),
          ...(zone && { zone }),
          ...(text && { text }),
          ...(representative && { representative }),
          ...(before && { before }),
          ...(after && { after }),
          ...(sort && { sort }),
          ...(direction && { direction })
        };
      })
    );
  }

  setParamsFromRoute(queryParams: Params, view: 'flights' | 'campaigns') {
    if (queryParams) {
      const params: DashboardParams = {
        view,
        page: (queryParams['page'] && +queryParams['page']) || 1,
        ...(queryParams['per'] && { per: +queryParams['per'] }),
        ...(queryParams['advertiser'] && { advertiser: +queryParams['advertiser'] }),
        ...(queryParams['podcast'] && { podcast: +queryParams['podcast'] }),
        ...(queryParams['status'] && { status: queryParams['status'] }),
        ...(queryParams['type'] && { type: queryParams['type'] }),
        ...(queryParams['geo'] && { geo: queryParams['geo'].split('|') }),
        ...(queryParams['zone'] && { zone: queryParams['zone'].split('|') }),
        ...(queryParams['text'] && { text: queryParams['text'] }),
        ...(queryParams['representative'] && { representative: queryParams['representative'] }),
        ...(queryParams['before'] && { before: new Date(queryParams['before']) }),
        ...(queryParams['after'] && { after: new Date(queryParams['after']) }),
        ...(queryParams['sort'] && { sort: queryParams['sort'] }),
        ...(queryParams['direction'] && { direction: queryParams['direction'] })
      };
      switch (view) {
        case 'campaigns':
          this.loadCampaignList(params);
          break;
        case 'flights':
        default:
          this.loadFlightList(params);
          break;
      }
      this._params.next(params);
    }
  }

  routeToParams(partialParams: DashboardParams) {
    this.getRouteParams(partialParams)
      .pipe(first())
      .subscribe(params => {
        const {
          view,
          page,
          per,
          advertiser,
          podcast,
          status,
          type,
          before,
          after,
          geo,
          zone,
          text,
          representative,
          sort,
          direction
        } = params;
        this.router.navigate([view || 'flights'], {
          queryParams: {
            ...(page && { page }),
            ...(per && { per }),
            ...(advertiser && { advertiser }),
            ...(podcast && { podcast }),
            ...(status && { status }),
            ...(type && { type }),
            ...(before && { before }),
            ...(after && { after }),
            ...(geo && { geo }),
            ...(zone && { zone }),
            ...(text && { text }),
            ...(representative && { representative }),
            ...(sort && { sort }),
            ...(direction && { direction })
          }
        });
      });
  }
}
