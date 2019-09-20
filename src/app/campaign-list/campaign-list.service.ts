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

@Injectable()
export class CampaignListService {
  params: CampaignParams = {page: 1, per: 12};
  facets: Facets;
  total: number;
  count: number;
  error: Error;
  // tslint:disable-next-line: variable-name
  private _campaigns = new BehaviorSubject<{[id: number]: Campaign}>({});
  // tslint:disable-next-line: variable-name
  private _currentCampaignIds: number[]; // campaign ids for current request/filter params

  constructor(private augury: AuguryService) {}

  get loading(): Observable<boolean[]> {
    return this.campaigns.pipe(
      map(campaigns => campaigns && campaigns.filter(c => c.loading).map(c => c.loading))
    );
  }

  get campaigns(): Observable<Campaign[]> {
    // this._campaigns is a subject of campaign entities (an object with campaignIds mapped to campaign,) convert to array for display
    return this._campaigns.asObservable().pipe(
      map((campaignEntities: {}) => {
        if (this._currentCampaignIds && this._currentCampaignIds.length) {
          return this._currentCampaignIds
            // map from array of Ids
            .filter(campaignId => campaignEntities[campaignId])
            .map(campaignId => campaignEntities[campaignId])
        }
      })
    );
  }

  get loadedCampaigns(): Observable<Campaign[]> {
    return this.campaigns.pipe(
      map((campaigns: Campaign[]) => campaigns && campaigns.filter(c => !c.loading))
    );
  }

  loadCampaignList(newParams?: CampaignParams) {
    this.count = 0;

    // newParams includes all params (from route) except per
    this.params = {...newParams, per: this.params.per, page: (newParams && newParams.page) || 1};
    const { page, per, advertiser, podcast, status, type, geo, zone, text, representative, before, after } = this.params;
    const filters = this.getFilters({advertiser, podcast, status, type, geo, zone, text, representative, before, after});

    this.augury.follow('prx:campaigns', {
      page,
      per,
      ...(filters && {filters})
    }).pipe(
      switchMap(result => {
        this.count = +result['count'];
        this.total = +result['total'];
        this.facets = result['facets'];
        return result.followList('prx:items');
      }),
      switchMap((campaignDocs: HalDoc[]) => {
        this._campaigns.next(campaignDocs.reduce((acc, doc) => {
          acc[doc.id] = {loading: true};
          return acc;
        }, {}));
        // campaigns state is mapped from a list of ids from the current request/filter params
        this._currentCampaignIds = campaignDocs.map(c => c['id']);
        return campaignDocs.map(doc => {
          return combineLatest(
            of(doc),
            doc.follow('prx:advertiser'),
            doc.followItems('prx:flights')
          );
        });
      }),
      concatAll(),
      withLatestFrom(this._campaigns)
    ).subscribe(([[campaignDoc, advertiserDoc, flightDocs], campaigns]) => {
      const campaign: Campaign = {
        id: campaignDoc['id'],
        ...(campaignDoc['_links'] && campaignDoc['_links']['prx:account'] &&
          {accountId:  parseInt(campaignDoc['_links']['prx:account']['href'].split('/').pop(), 10)}),
        name: campaignDoc['name'],
        type: campaignDoc['type'],
        status: campaignDoc['status'],
        repName: campaignDoc['repName'],
        notes: campaignDoc['notes'],
        loading: false,
        advertiser: {id: advertiserDoc['id'], label: advertiserDoc['name']},
        flights: flightDocs.map(doc => ({
          name: doc['name'],
          startAt: doc['startAt'] && new Date(doc['startAt']),
          endAt: doc['endAt'] && new Date(doc['endAt']),
          // map zonesId from facets
          zones: doc['zones'].map(zoneId => {
            const zoneFacet = this.facets && this.facets.zone && this.facets.zone.find(facet => facet.id === zoneId)
            return zoneFacet && zoneFacet.label || zoneId;
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
    err => this.error = err);
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
}
