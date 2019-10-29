import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { switchMap, concatAll, withLatestFrom, map } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';

interface KeyValue {
  id: number | string;
  label: string;
}

// export type Zone = KeyValue;
export type Target = KeyValue;
export type Advertiser = KeyValue;
export type Facet = KeyValue;
export interface CampaignParams {
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
  desc?: boolean;
}

// TODO: Omit is added in TS 3.5
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export interface CampaignRouteParams extends Omit<CampaignParams, 'geo' | 'zone' | 'before' | 'after'> {
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
  name: string;
  startAt: Date;
  endAt: Date;
  zones: string[];
  targets?: Target[];
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
}

@Injectable({
  providedIn: 'root'
})
export class CampaignListService {
  params: CampaignParams = { page: 1, per: 12 };
  facets: Facets;
  total: number;
  count: number;
  error: Error;
  // tslint:disable-next-line: variable-name
  private _campaigns = new BehaviorSubject<{ [id: number]: Campaign }>({});
  // tslint:disable-next-line: variable-name
  private _currentCampaignIds: number[]; // campaign ids for current request/filter params

  constructor(private augury: AuguryService) {}

  get loading(): Observable<boolean[]> {
    return this.campaigns.pipe(map(campaigns => campaigns && campaigns.filter(c => c.loading).map(c => c.loading)));
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

  loadCampaignList(newParams?: CampaignParams) {
    this.count = 0;

    // newParams includes all params (from route) except per
    this.params = { ...newParams, per: this.params.per, page: (newParams && newParams.page) || 1 };
    const { page, per, advertiser, podcast, status, type, geo, zone, text, representative, before, after, desc } = this.params;
    const filters = this.getFilters({ advertiser, podcast, status, type, geo, zone, text, representative, before, after });

    this.augury
      .follow('prx:campaigns', {
        page,
        per,
        zoom: 'prx:flights,prx:advertiser',
        ...(filters && { filters }),
        sorts: 'flight_start_at:' + (desc ? 'desc' : 'asc')
      })
      .pipe(
        switchMap(result => {
          this.count = +result['count'];
          this.total = +result['total'];
          this.facets = result['facets'];
          return result.followList('prx:items');
        }),
        switchMap((campaignDocs: HalDoc[]) => {
          this._campaigns.next(
            campaignDocs.reduce((acc, doc) => {
              return { ...acc, [doc.id]: { loading: true } };
            }, {})
          );
          // campaigns state is mapped from a list of ids from the current request/filter params
          this._currentCampaignIds = campaignDocs.map(c => c['id']);
          return campaignDocs.map(doc => {
            return combineLatest(of(doc), doc.follow('prx:advertiser'), doc.followItems('prx:flights'));
          });
        }),
        concatAll(),
        withLatestFrom(this._campaigns)
      )
      .subscribe(
        ([[campaignDoc, advertiserDoc, flightDocs], campaigns]) => {
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
            loading: false,
            advertiser: { id: advertiserDoc['id'], label: advertiserDoc['name'] },
            flights: flightDocs.map(doc => ({
              name: doc['name'],
              startAt: doc['startAt'] && new Date(doc['startAt']),
              endAt: doc['endAt'] && new Date(doc['endAt']),
              // map zonesId from facets
              zones: doc['zones'].map(zoneId => {
                const zoneFacet = this.facets && this.facets.zone && this.facets.zone.find(facet => facet.id === zoneId);
                return (zoneFacet && zoneFacet.label) || zoneId;
              })
              // TODO: no targets yet?
              // targets: Target[];
            }))
          };

          // set _campaigns[campaign.id]
          this._campaigns.next({
            ...campaigns,
            [campaign.id]: campaign
          });
        },
        err => (this.error = err)
      );
  }

  getFilters(params: CampaignParams) {
    let filters = '';
    if (params.advertiser) {
      filters += `advertiser=${params.advertiser}`;
    }
    if (params.podcast) {
      if (filters) {
        filters += ',';
      }
      filters += `podcast=${params.podcast}`;
    }
    if (params.status) {
      if (filters) {
        filters += ',';
      }
      filters += `status=${params.status}`;
    }
    if (params.type) {
      if (filters) {
        filters += ',';
      }
      filters += `type=${params.type}`;
    }
    if (params.geo && params.geo.length) {
      if (filters) {
        filters += ',';
      }
      filters += `geo=${params.geo.join(',')}`;
    }
    if (params.zone && params.zone.length) {
      if (filters) {
        filters += ',';
      }
      filters += `zone=${params.zone.join(',')}`;
    }
    if (params.text) {
      if (filters) {
        filters += ',';
      }
      filters += `text=${params.text}`;
    }
    if (params.representative) {
      if (filters) {
        filters += ',';
      }
      filters += `representative=${params.representative}`;
    }
    if (params.before) {
      if (filters) {
        filters += ',';
      }
      filters += `before=${params.before.toISOString()}`;
    }
    if (params.after) {
      if (filters) {
        filters += ',';
      }
      filters += `after=${params.after.toISOString()}`;
    }
    return filters;
  }

  getRouteQueryParams(partialParams: CampaignParams): CampaignRouteParams {
    let { page, advertiser, podcast, status, type, text, representative, desc } = partialParams;

    // this function takes partial parameters (what changed)
    // mix in the existing this.params unless property was explicitly set in partialParams
    if (!partialParams.hasOwnProperty('page') && this.params.page) {
      page = this.params.page;
    }
    if (!partialParams.hasOwnProperty('advertiser') && this.params.advertiser) {
      advertiser = this.params.advertiser;
    }
    if (!partialParams.hasOwnProperty('podcast') && this.params.podcast) {
      podcast = this.params.podcast;
    }
    if (!partialParams.hasOwnProperty('status') && this.params.status) {
      status = this.params.status;
    }
    if (!partialParams.hasOwnProperty('type') && this.params.type) {
      type = this.params.type;
    }
    if (!partialParams.hasOwnProperty('text') && this.params.text) {
      text = this.params.text;
    }
    if (!partialParams.hasOwnProperty('representative') && this.params.representative) {
      representative = this.params.representative;
    }
    if (!partialParams.hasOwnProperty('desc') && this.params.hasOwnProperty('desc')) {
      desc = this.params.desc;
    }
    let before: string;
    let after: string;
    if (partialParams.before) {
      before = partialParams.before.toISOString();
    } else if (!partialParams.hasOwnProperty('before') && this.params.before) {
      before = this.params.before.toISOString();
    }
    if (partialParams.after) {
      after = partialParams.after.toISOString();
    } else if (!partialParams.hasOwnProperty('after') && this.params.after) {
      after = this.params.after.toISOString();
    }
    let geo;
    if (partialParams.geo) {
      geo = partialParams.geo.join('|');
    } else if (this.params.geo) {
      geo = this.params.geo.join('|');
    }
    let zone;
    if (partialParams.zone) {
      zone = partialParams.zone.join('|');
    } else if (this.params.zone) {
      zone = this.params.zone.join('|');
    }
    return {
      ...(page && { page }),
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
      ...((desc || desc === false) && { desc })
    };
  }
}
