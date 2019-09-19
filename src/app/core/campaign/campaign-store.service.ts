import { Injectable } from '@angular/core';
import { CampaignService } from './campaign.service';
import { CampaignState, FlightState, CampaignStateChanges, Campaign } from './campaign.models';
import { ReplaySubject, Observable, forkJoin, of } from 'rxjs';
import { map, first, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CampaignStoreService {
  readonly campaign$ = new ReplaySubject<CampaignState>(1);
  readonly flights$ = this.campaign$.pipe(map(c => c.flights));
  readonly remoteCampaign$ = this.campaign$.pipe(map(state => state && state.remoteCampaign));
  readonly localCampaign$ = this.campaign$.pipe(map(state => state && state.localCampaign));

  get campaign(): Observable<CampaignState> {
    return this.campaign$.pipe(first());
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
      this.campaign$.next(newState);
      return of(newState);
    } else {
      const lazyState = new ReplaySubject<CampaignState>(1);

      // non-lazy load
      this.campaignService
        .getCampaign(id)
        .pipe(first())
        .subscribe(state => {
          this.campaign$.next(state);
          lazyState.next(state);
        });

      return lazyState;
    }
  }

  storeCampaign(): Observable<CampaignStateChanges> {
    const changes = new ReplaySubject<CampaignStateChanges>(1);

    // non-lazy save
    this.putCampaign()
      .pipe(
        switchMap(campaignChanges => {
          return this.putFlights().pipe(
            map(flightChanges => {
              this.campaign$.next({
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
        })
      )
      .subscribe(val => changes.next(val));

    return changes;
  }

  setCampaign(newState: { localCampaign: Campaign; changed: boolean; valid: boolean }): Observable<CampaignState> {
    const lazyState = new ReplaySubject<CampaignState>(1);
    const { localCampaign, changed, valid } = newState;

    // non-lazy update
    this.campaign.subscribe(state => {
      const updatedState = { ...state, localCampaign, changed, valid };
      this.campaign$.next(updatedState);
      lazyState.next(updatedState);
    });

    return lazyState;
  }

  setFlight(flightState: FlightState, flightId: string | number): Observable<CampaignState> {
    const lazyState = new ReplaySubject<CampaignState>(1);

    // non-lazy update
    this.campaign.subscribe(state => {
      const updatedFlights = { ...state.flights, [flightId]: { ...state.flights[flightId], ...flightState } };
      const updatedState = { ...state, flights: updatedFlights };
      this.campaign$.next(updatedState);
      lazyState.next(updatedState);
    });

    return lazyState;
  }

  private putCampaign(): Observable<{ prevId: number; state: CampaignState }> {
    return this.campaign.pipe(
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
    return this.campaign.pipe(
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
