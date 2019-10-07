import { Injectable } from '@angular/core';
import { CampaignService } from './campaign.service';
import { CampaignState, FlightState, CampaignStateChanges, Campaign, Flight, Availability } from './campaign.models';
import { ReplaySubject, Observable, forkJoin, of } from 'rxjs';
import { map, first, switchMap, share, withLatestFrom, publish, refCount } from 'rxjs/operators';

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

  setCurrentFlightId(flightId: string) {
    this.campaign$.pipe(
      first()
    ).subscribe(state => this._campaign$.next({...state, currentFlightId: flightId}));
  }

  get currentFlightAvailability$(): Observable<Availability[]> {
    return this.campaign$.pipe(
      map(state => {
        // availability of current flights
        const availabilityZones = state.flights[state.currentFlightId] &&
          state.flights[state.currentFlightId].localFlight &&
          state.flights[state.currentFlightId].localFlight.zones &&
          state.availability &&
          state.flights[state.currentFlightId].localFlight.zones
            .filter(zone => state.availability[`${state.currentFlightId}-${zone}`])
            .map(zone => state.availability[`${state.currentFlightId}-${zone}`]);
        // each zone
        const zoneWeeks = availabilityZones && availabilityZones.map((availability: Availability) => {
          let weekBeginString: string;
          let weekEnd: Date;
          // acc weeks
          return availability.availabilityAllocationDays.reduce((acc, day) => {
            const dayDate = new Date(day.date);
            if (!weekEnd || weekEnd.valueOf() <= dayDate.valueOf()) {
              weekBeginString = day.date;
              weekEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0);
              weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
            }
            const week = acc.weeks[weekBeginString];
            acc.weeks[weekBeginString] = {
              allocated: week && week.allocated ? week.allocated + day.allocated : day.allocated || 0,
              availability: week && week.availability ? week.availability + day.availability : day.availability || 0,
              date: weekBeginString,
              days: week && week.days ? week.days.concat([day]) : [day]
            };
            return acc;
          }, {zone: availability.zone, startDate: availability.startDate, endDate: availability.endDate, weeks: {}});
        });
        // map week acc keys to array
        return zoneWeeks && zoneWeeks.map(zw => {
          const { zone, endDate, startDate } = zw;
          return {
            zone, endDate, startDate,
            availabilityAllocationDays: Object.keys(zw.weeks)
              .map(w => zw.weeks[w])
              .sort((a, b) => new Date(a.startAt).valueOf() - new Date(b.startAt).valueOf())
          };
        });
      })
    );
  }

  loadAvailability(flight: Flight): Observable<Availability[]> {
    // Flight dates are typed string but are actually sometimes Date
    const startDate = new Date(flight.startAt.valueOf()).toISOString().slice(0, 10);
    const endDate = new Date(flight.endAt.valueOf()).toISOString().slice(0, 10);
    if (flight.startAt && flight.endAt && flight.set_inventory_uri && flight.zones && flight.zones.length > 0) {
      const inventoryId = flight.set_inventory_uri.split('/').pop();
      const loading = forkJoin(flight.zones.map((zoneName) => {
        return this.campaignService.getInventoryAvailability({
          id: inventoryId,
          startDate,
          endDate,
          zoneName,
          flightId: flight.id
        }).pipe(map(availabilityDoc => this.campaignService.docToAvailability(zoneName, availabilityDoc)));
      })).pipe(
        publish(),
        refCount()
      );
      loading.pipe(first(), withLatestFrom(this._campaign$)).subscribe(([availabilities, state]) => {
        const updatedState = {
          ...state,
          availability: {
            ...state.availability,
            ...availabilities.reduce((acc, availability) => ({...acc, [`${flight.id}-${availability.zone}`]: availability}), {})
          }
        };
        this._campaign$.next(updatedState);
      });
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
