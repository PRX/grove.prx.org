import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, switchMap, catchError, first } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { Flight } from '../../core';

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

@Injectable()
export class CampaignService {
  currentState$ = new ReplaySubject<CampaignState>(1);
  currentStateFirst$ = this.currentState$.pipe(first());
  currentRemoteCampaign$ = this.currentState$.pipe(map(state => state.remoteCampaign));
  currentLocalCampaign$ = this.currentState$.pipe(map(state => state.localCampaign));

  constructor(private augury: AuguryService) {}

  getCampaign(id: number | string): Observable<CampaignState> {
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
      this.setCurrentState(newState);
      return of(newState);
    } else {
      return this.augury.follow('prx:campaign', { id, zoom: 'prx:flights' }).pipe(
        switchMap(this.docToCampaign),
        catchError(this.handleError),
        map(state => this.setCurrentState(state))
      );
    }
  }

  putCampaign(): Observable<CampaignState> {
    return this.currentStateFirst$.pipe(
      switchMap(state => {
        if (state.remoteCampaign) {
          return this.augury.follow('prx:campaign', { id: state.remoteCampaign.id }).pipe(
            switchMap(doc => doc.update(state.localCampaign)),
            switchMap(this.docToCampaign),
            map(nextState => this.setCurrentState(nextState))
          );
        } else {
          return this.augury.root.pipe(
            switchMap(rootDoc => rootDoc.create('prx:campaign', {}, state.localCampaign)),
            switchMap(this.docToCampaign),
            map(nextState => this.setCurrentState(nextState))
          );
        }
      })
    );
  }

  setCurrentState(state: CampaignState): CampaignState {
    this.currentState$.next(state);
    return state;
  }

  docToCampaign(doc: HalDoc): Observable<CampaignState> {
    const campaign = doc.asJSON() as Campaign;
    campaign.set_advertiser_uri = doc.expand('prx:advertiser');
    campaign.set_account_uri = doc.expand('prx:account');
    return doc.followItems('prx:flights').pipe(
      map(flightDocs => {
        const flights = flightDocs.reduce((prev, flight) => {
          prev[flight.id.toString()] = {
            campaignId: campaign.id,
            remoteFlight: flight,
            localFlight: flight,
            changed: false,
            valid: true
          };
          return prev;
        }, {});
        return {
          remoteCampaign: campaign,
          localCampaign: campaign,
          flights,
          changed: false,
          valid: true
        };
      })
    );
  }

  handleError(err: any) {
    if (err.status === 404) {
      return of(null);
    } else {
      throw err;
    }
  }
}
