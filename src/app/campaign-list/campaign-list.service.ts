import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { concatMap, concatAll, withLatestFrom, map } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';

export interface CampaignParams {
  page?: number;
  per?: number;
}

interface KeyValue {
  id: number;
  label: string;
}

// export type Zone = KeyValue;
export type Target = KeyValue;
export type Advertiser = KeyValue;
export type Facet = KeyValue;

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
}

@Injectable()
export class CampaignListService {
  params = {page: 1, per: 12};
  facets: {
    advertiser: Facet[],
    podcast: Facet[],
    status: Facet[],
    type: Facet[]
  };
  total: number;
  count: number;
  error: Error;
  loading = false;
  flightsLoaded: number;
  // tslint:disable-next-line: variable-name
  private _campaigns = new BehaviorSubject<{[id: number]: Campaign}>({});

  constructor(private augury: AuguryService) {}

  get campaigns(): Observable<Campaign[]> {
    // this._campaigns is a subject of campaign entities (an object with campaignIds mapped to campaign,) convert to array for display
    return this._campaigns.asObservable().pipe(
      map((campaignEntities: {}) => {
        if (Object.keys(campaignEntities).length) {
          return Object.keys(campaignEntities)
            // map to array
            .map(campaignId => campaignEntities[campaignId])
            // sort by ?
            .sort((a, b ) => {
              // TODO: name seems to be the default sort on the API, but what makes sense for the dashboard?
              return a.name - b.name;
            });
        }
      })
    );
  }

  loadCampaignList(params?: CampaignParams) {
    if (params) {
      this.params = {
        ...this.params,
        ...(params.page && {page: params.page}),
        ...(params.per && {per: params.per})
      };
    }
    this.count = 0;
    this.loading = true;
    this.flightsLoaded = 0;

    // clear campaign list
    this._campaigns.next({});

    this.augury.followItems(
      'prx:campaigns',
      {page: this.params.page, per: this.params.per}
    ).pipe(
      concatMap((campaignDocs: HalDoc[]) => {
        if (campaignDocs.length) {
          this.count = campaignDocs[0]['_count'];
          this.total = campaignDocs[0]['_total'];
          this.facets = campaignDocs[0]['_facets'];
        }
        return campaignDocs.map(doc => {
          return combineLatest(
            of(doc),
            doc.follow('prx:advertiser'),
            doc.followItems('prx:flights')
          );
        });
      }),
      concatAll(),
      withLatestFrom(this._campaigns),
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
        advertiser: {id: advertiserDoc['id'], label: advertiserDoc['name']},
        flights: flightDocs.map(doc => ({
          name: doc['name'],
          startAt: doc['startAt'] && new Date(doc['startAt']),
          endAt: doc['endAt'] && new Date(doc['endAt']),
          zones: doc['zones']
          // TODO: no targets yet?
          // targets: Target[];
        }))
      };
      if (flightDocs) {
        this.flightsLoaded++;
        if (this.flightsLoaded === this.count) {
          this.loading = false;
        }
      }

      // set _campaigns[campaign.id]
      this._campaigns.next({
        ...campaigns,
        [campaign.id]: campaign
      });
    },
    err => this.error = err);
  }
}
