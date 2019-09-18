import { Injectable } from '@angular/core';
import { CampaignService } from './campaign.service';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CampaignState {
  localCampaign: Campaign;
  remoteCampaign?: Campaign;
  flights: { [id: string]: FlightState };
  changed: boolean;
  valid: boolean;
}

export interface FlightState {
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
  totalGoal: number;
  set_inventory_uri: string;
}

@Injectable({ providedIn: 'root' })
export class CampaignStoreService {
  private currentCampaign: CampaignState;
  readonly campaign$ = new ReplaySubject<CampaignState>(1);
  readonly flights$ = this.campaign$.pipe(map(c => c.flights));
  readonly remoteCampaign$ = this.campaign$.pipe(map(state => state && state.remoteCampaign));
  readonly localCampaign$ = this.campaign$.pipe(map(state => state && state.localCampaign));

  get campaign(): CampaignState {
    return this.currentCampaign;
  }

  set campaign(val: CampaignState) {
    this.currentCampaign = val;
    this.campaign$.next(val);
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

  async fetchCampaign(id: number | string) {
    this.campaign = await this.campaignService.getCampaign(id).toPromise();
  }

  async storeCampaign() {
    try {
      const campaign = await this.campaignService.putCampaign(this.campaign).toPromise();

      const flights = {};
      await Promise.all(
        Object.keys(this.campaign.flights).map(async oldKey => {
          const flight = await this.campaignService.putFlight(this.campaign.flights[oldKey]).toPromise();
          flights[flight.remoteFlight.id] = flight;
        })
      );

      this.campaign = { ...campaign, flights };
      return this.campaign;
    } catch (e) {
      // TODO: revert update
      console.error(e);
    }
  }

  setFlight(flightState: FlightState, flightId: string) {
    this.campaign = {
      ...this.campaign,
      flights: {
        ...this.campaign.flights,
        [flightId]: { ...this.campaign.flights[flightId], ...flightState }
      }
    };
  }
}
