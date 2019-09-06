import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { concatMap, concatAll } from 'rxjs/operators';
import { HalDoc, HalObservable } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';

export interface CampaignParams {
  page?: number;
  per?: number;
}

interface KeyValue {
  id: number;
  name: string;
}

// export type Zone = KeyValue;
export type Target = KeyValue;
export type Advertiser = KeyValue;

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
  advertiser: Advertiser;
  type: string;
  status: string;
  repName: string;
  notes: string;
  flights?: Flight[];
}

@Injectable()
export class CampaignListService {
  params = {page: 1, per: 9};
  total: number;
  error: Error;
  // tslint:disable-next-line: variable-name
  private _campaigns = new BehaviorSubject([]);

  constructor(private augury: AuguryService) {
    this.loadCampaignList();
  }

  get campaigns(): Observable<Campaign[]> {
    return this._campaigns.asObservable();
  }

  loadCampaignList(params?: CampaignParams) {
    if (params) {
      this.params = {
        ...this.params,
        ...(params.page && {page: params.page}),
        ...(params.per && {per: params.per})
      };
    }
    let campaigns: Campaign[];
    let campaignIndex = 0;

    this.augury.followItems(
      'prx:campaigns',
      {page: this.params.page, per: this.params.per}
    ).pipe(
      concatMap((campaignDocs: HalDoc[]) => {
        this.total = campaignDocs.length ? campaignDocs[0]['_total'] : 0;
        campaigns = campaignDocs.map(doc => {
          return {
            id: doc['id'],
            accountId: doc['_links'] && parseInt(doc['_links']['prx:account']['href'].split('/').pop(), 10),
            name: doc['name'],
            // TODO: should "follow" advertiser
            advertiser: doc['_embedded'] && {
              id: doc['_embedded']['prx:advertiser'].id,
              name: doc['_embedded']['prx:advertiser'].name
            },
            type: doc['type'],
            status: doc['status'],
            repName: doc['repName'],
            notes: doc['notes']
          };
        });
        return campaignDocs.map(campaign => campaign.followItems('prx:flights'));
      }),
      concatAll()
    ).subscribe((flightDocs: HalDoc[]) => {
      campaigns[campaignIndex++].flights = flightDocs.map(doc => {
        return {
          name: doc['name'],
          startAt: doc['startAt'] && new Date(doc['startAt']),
          endAt: doc['endAt'] && new Date(doc['endAt']),
          zones: doc['zones']
          // TODO: no targets yet?
          // targets: Target[];
        };
      });
      this._campaigns.next(campaigns);
    },
    err => this.error = err);
  }
}
