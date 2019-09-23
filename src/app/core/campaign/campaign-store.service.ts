import { Injectable } from '@angular/core';
import { CampaignService } from './campaign.service';
import { CampaignState, FlightState, CampaignStateChanges, Campaign } from './campaign.models';
import { ReplaySubject, Observable, forkJoin, of } from 'rxjs';
import { map, first, switchMap, share } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CampaignStoreService {
  // tslint:disable-next-line
  private _campaign$ = new ReplaySubject<CampaignState>(1);

  get campaign$(): Observable<CampaignState> {
    return this._campaign$.asObservable();
  }

  get campaignFirst$(): Observable<CampaignState> {
    return this.campaign$.pipe(first());
  }

  get localCampaign$(): Observable<Campaign> {
    return this.campaign$.pipe(map(state => state && state.localCampaign));
  }

  get flights$(): Observable<{ [id: string]: FlightState }> {
    return this.campaign$.pipe(map(c => c.flights));
  }

  constructor(private campaignService: CampaignService) {}

  load(id: number | string = null): Observable<CampaignState> {
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
      this._campaign$.next(newState);
      return of(newState);
    } else {
      const loading = this.campaignService.getCampaign(id).pipe(
        first(),
        share()
      );
      loading.subscribe(state => this._campaign$.next(state));
      return loading;
    }
  }

  storeCampaign(): Observable<CampaignStateChanges> {
    const saving = this.putCampaign().pipe(
      switchMap(campaignChanges => {
        return this.putFlights().pipe(
          map(flightChanges => {
            this._campaign$.next({
              ...campaignChanges.state,
              flights: flightChanges.reduce((obj, { state }) => ({ ...obj, [state.remoteFlight.id]: state }), {})
            });
            return {
              id: campaignChanges.state.remoteCampaign.id,
              prevId: campaignChanges.prevId,
              flights: flightChanges.reduce((obj, { prevId, state }) => ({ ...obj, [prevId]: state.remoteFlight.id }), {})
            };
          })
        );
      }),
      share()
    );
    saving.subscribe();
    return saving;
  }

  setCampaign(newState: { localCampaign: Campaign; changed: boolean; valid: boolean }): Observable<CampaignState> {
    const { localCampaign, changed, valid } = newState;
    const updating = this.campaignFirst$.pipe(
      map(state => {
        const updatedState = { ...state, localCampaign, changed, valid };
        return updatedState;
      }),
      share()
    );
    updating.subscribe(state => this._campaign$.next(state));
    return updating;
  }

  setFlight(flightState: FlightState, flightId: string | number): Observable<CampaignState> {
    const updating = this.campaignFirst$.pipe(
      map(state => {
        const updatedFlights = { ...state.flights, [flightId]: { ...state.flights[flightId], ...flightState } };
        const updatedState = { ...state, flights: updatedFlights };
        return updatedState;
      }),
      share()
    );
    updating.subscribe(state => this._campaign$.next(state));
    return updating;
  }

  private putCampaign(): Observable<{ prevId: number; state: CampaignState }> {
    return this.campaignFirst$.pipe(
      switchMap(state => {
        return this.campaignService.putCampaign(state).pipe(
          map(newState => {
            return { prevId: state.remoteCampaign ? state.remoteCampaign.id : null, state: newState };
          })
        );
      })
    );
  }

  private putFlights(): Observable<{ prevId: string; state: FlightState }[]> {
    return this.campaignFirst$.pipe(
      switchMap(state => {
        return forkJoin(
          Object.keys(state.flights).map(key => {
            return this.campaignService.putFlight(state.flights[key]).pipe(
              map(newState => {
                return { prevId: key, state: newState };
              })
            );
          })
        );
      })
    );
  }
}
