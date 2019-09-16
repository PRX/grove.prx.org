import { Injectable } from '@angular/core';
import { CampaignService } from './campaign.service';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CampaignState {
  localCampaign: Campaign;
  remoteCampaign?: Campaign;
  flights: { [id: string]: FlightState };
  changed: boolean;
  valid: boolean;
}

export interface FlightState {
  campaignId: number;
  localFlight: Flight;
  remoteFlight?: Flight;
  changed: boolean;
  valid: boolean;
}

export interface Campaign {
  id?: number;
  name: string;
  type: string;
  status: string;
  repName: string;
  notes: string;
  set_account_uri: string;
  set_advertiser_uri: string;
}

export interface Flight {
  id?: number;
  name: string;
  startAt: string;
  endAt: string;
}

@Injectable({ providedIn: 'root' })
export class CampaignStoreService {
  // tslint:disable-next-line:variable-name
  private readonly _campaign = new BehaviorSubject<CampaignState>(null);
  readonly campaign$ = this._campaign.asObservable();
  readonly remoteCampaign$ = this.campaign$.pipe(map(state => state && state.remoteCampaign));
  readonly localCampaign$ = this.campaign$.pipe(map(state => state && state.localCampaign));

  get campaign(): CampaignState {
    return this._campaign.getValue();
  }

  set campaign(val: CampaignState) {
    this._campaign.next(val);
  }

  constructor(private campaignService: CampaignService) {}

  createWithId(id: number | string = null) {
    if (!id) {
      const newState: CampaignState = {
        localCampaign: {
          name: null,
          type: null,
          status: null,
          repName: null,
          notes: null,
          set_account_uri: null,
          set_advertiser_uri: null
        },
        flights: {},
        changed: false,
        valid: false
      };
      this.campaign = newState;
    } else {
      this.fetchCampaign(id);
    }
  }

  async fetchCampaign(id) {
    this.campaign = await this.campaignService.getCampaign(id).toPromise();
  }

  async storeCampaign() {
    try {
      this.campaign = await this.campaignService.putCampaign(this.campaign).toPromise();
      return this.campaign;
    } catch (e) {
      // TODO: revert update
      console.error(e);
    }
  }

  addFlight(flightState: FlightState, flightId) {
    this.campaign = {
      ...this.campaign,
      flights: {
        ...this.campaign.flights,
        [flightId]: flightState
      }
    };
  }
}
