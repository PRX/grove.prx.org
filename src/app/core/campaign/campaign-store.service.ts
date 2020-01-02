import { Injectable } from '@angular/core';
import { CampaignService } from './campaign.service';
import { InventoryService } from '../inventory/inventory.service';
import { AllocationPreviewService } from '../allocation/allocation-preview.service';
import {
  CampaignState,
  FlightState,
  CampaignStateChanges,
  Campaign,
  Flight,
  Availability,
  Allocation,
  AllocationPreview
} from './campaign.models';
import { ReplaySubject, Observable, forkJoin, of } from 'rxjs';
import { map, first, switchMap, share, withLatestFrom, mergeMap } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';

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
    return this.campaign$.pipe(map(c => c && c.flights));
  }

  constructor(
    private campaignService: CampaignService,
    private inventoryService: InventoryService,
    private allocationPreviewService: AllocationPreviewService
  ) {}

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
      const loading = this.campaignService.getCampaign(id).pipe(first(), share());
      loading.subscribe(state => this._campaign$.next(state));
      return loading;
    }
  }

  getFlightDailyMin$(flightId: string | number): Observable<number> {
    return this.campaign$.pipe(map(s => s.dailyMinimum && s.dailyMinimum[`${flightId}`]));
  }

  getFlightAvailabilityRollup$(flightId: string | number): Observable<Availability[]> {
    return this.campaign$.pipe(
      map(state => {
        // availability of current flights
        // `${flightId}` because flightId is sometimes a number, sometimes a string but is a string in the store ids
        const availabilityZones =
          state.flights[`${flightId}`] &&
          state.flights[`${flightId}`].localFlight &&
          state.flights[`${flightId}`].localFlight.zones &&
          state.availability &&
          state.flights[`${flightId}`].localFlight.zones
            .filter(zone => state.availability[`${flightId}-${zone}`])
            .map(zone => state.availability[`${flightId}-${zone}`]);
        // each zone
        const zoneWeeks =
          availabilityZones &&
          availabilityZones.map((availability: Availability) => {
            let weekBeginString: string;
            let weekEnd: Date;
            // acc weeks
            return availability.totals.groups.reduce(
              (acc, day) => {
                // get the day's allocationPreview from the allocationPreview state
                day.allocationPreview =
                  state.allocationPreview &&
                  state.allocationPreview[`${flightId}`] &&
                  state.allocationPreview[`${flightId}`][availability.zone] &&
                  state.allocationPreview[`${flightId}`][availability.zone].allocations &&
                  state.allocationPreview[`${flightId}`][availability.zone].allocations[day.startDate] &&
                  state.allocationPreview[`${flightId}`][availability.zone].allocations[day.startDate].goalCount;

                const dayDate = new Date(day.startDate + ' 0:0:0');
                // if dayDate has passed into the next week (past prior weekEnd)
                if (!weekEnd || weekEnd.valueOf() <= dayDate.valueOf()) {
                  weekBeginString = day.startDate;
                  weekEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59);
                  weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()));

                  // initialize week entry with day 0 values
                  acc.totals.groups[weekBeginString] = {
                    allocated: day.allocated,
                    availability: day.availability,
                    allocationPreview: day.allocationPreview,
                    startDate: weekBeginString,
                    endDate: weekEnd.toISOString().slice(0, 10),
                    groups: [day]
                  };
                } else {
                  // accumulate values onto week
                  acc.totals.groups[weekBeginString] = {
                    allocated: acc.totals.groups[weekBeginString].allocated + day.allocated,
                    availability: acc.totals.groups[weekBeginString].availability + day.availability,
                    allocationPreview: acc.totals.groups[weekBeginString].allocationPreview + day.allocationPreview,
                    startDate: weekBeginString,
                    endDate: weekEnd.toISOString().slice(0, 10),
                    groups: acc.totals.groups[weekBeginString].groups.concat([day])
                  };
                }
                // accumulate days onto totals
                acc.totals.allocated += day.allocated;
                acc.totals.availability += day.availability;
                acc.totals.allocationPreview += day.allocationPreview;
                return acc;
              },
              {
                zone: availability.zone,
                totals: {
                  startDate: availability.totals.startDate,
                  endDate: availability.totals.endDate,
                  allocated: 0,
                  availability: 0,
                  allocationPreview: 0,
                  groups: {}
                }
              }
            );
          });
        // map week acc keys to array
        return (
          zoneWeeks &&
          zoneWeeks.map(zw => {
            const { zone } = zw;
            const { endDate, startDate, allocated, availability, allocationPreview } = zw.totals;
            return {
              zone,
              totals: {
                endDate,
                startDate,
                allocated,
                availability,
                allocationPreview,
                groups: Object.keys(zw.totals.groups)
                  .map(w => zw.totals.groups[w])
                  .sort((a, b) => new Date(a.startAt).valueOf() - new Date(b.startAt).valueOf())
              }
            };
          })
        );
      })
    );
  }

  // the flightId parameter here will be the temp id in the case the flight has not yet been created
  loadAvailability(flight: Flight, flightId?: string): Observable<Availability[]> {
    if (flight.startAt && flight.endAt && flight.set_inventory_uri && flight.zones && flight.zones.length > 0) {
      // Flight dates are typed string but are actually sometimes Date
      const startDate = new Date(flight.startAt.valueOf()).toISOString().slice(0, 10);
      const endDate = new Date(flight.endAt.valueOf()).toISOString().slice(0, 10);
      const inventoryId = flight.set_inventory_uri.split('/').pop();
      const loading = forkJoin(
        flight.zones.map(zoneName => {
          return this.inventoryService.getInventoryAvailability({
            id: inventoryId,
            startDate,
            endDate,
            zoneName,
            // flight.id will be undefined if flight is not yet created, which is when flightId is provided as the temp id
            flightId: flight.id
          });
        })
      ).pipe(share());
      loading.pipe(first(), withLatestFrom(this._campaign$)).subscribe(([availabilities, state]) => {
        const updatedState = {
          ...state,
          availability: {
            ...state.availability,
            ...availabilities.reduce(
              (acc, availability) => ({ ...acc, [`${flightId || flight.id}-${availability.zone}`]: availability }),
              {}
            )
          }
        };
        this._campaign$.next(updatedState);
      });
      return loading;
    }
  }

  get allocationPreviewError() {
    return this.allocationPreviewService.error;
  }

  // the flightId parameter here will be the temp id in the case the flight has not yet been created
  loadAllocationPreview(
    { id, set_inventory_uri, name, startAt, endAt, totalGoal, zones }: Flight,
    flightId?: string | number,
    dailyMinimum?: number
  ): Observable<AllocationPreview> {
    // dates come back as Date but typed string, use YYYY-MM-DD formatted string
    startAt = new Date(startAt.valueOf()).toISOString().slice(0, 10);
    endAt = new Date(endAt.valueOf()).toISOString().slice(0, 10);
    const loading = this._campaign$.pipe(
      mergeMap(state => {
        if (!dailyMinimum && dailyMinimum !== 0 && state.dailyMinimum) {
          dailyMinimum = state.dailyMinimum[`${flightId || id}`];
        }
        return this.allocationPreviewService.getAllocationPreview({
          set_inventory_uri,
          name,
          startAt,
          endAt,
          totalGoal,
          dailyMinimum: dailyMinimum || 0,
          zones
        });
      }),
      share()
    );
    loading.pipe(first(), withLatestFrom(this._campaign$)).subscribe(([result, state]) => {
      let updatedState: CampaignState;
      if (result && result.zones) {
        updatedState = {
          ...state,
          allocationPreview: {
            ...state.allocationPreview,
            [`${flightId || id}`]: result.zones.reduce(
              (previewByZone, zone) => ({
                ...previewByZone,
                [`${zone}`]: {
                  ...result,
                  allocations: (result.allocations as Allocation[])
                    .filter(a => a.zoneName === zone)
                    .reduce((allocationsByDate, allocation) => ({ ...allocationsByDate, [allocation.date]: allocation }), {}),
                  zones: [zone]
                }
              }),
              {}
            )
          }
        };
      } else {
        // if no result clear allocationPreview for flight
        updatedState = {
          ...state,
          allocationPreview: {
            ...state.allocationPreview,
            [`${flightId || id}`]: null
          }
        };
      }
      updatedState.dailyMinimum = { ...updatedState.dailyMinimum, [`${flightId || id}`]: dailyMinimum };
      this._campaign$.next(updatedState);
    });
    return loading;
  }

  storeCampaign(): Observable<[CampaignStateChanges, HalDoc[]]> {
    const saving = this.putCampaign().pipe(
      switchMap(campaignChanges => {
        const { flights } = campaignChanges.state;
        return forkJoin(
          this.putFlights().pipe(
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
          ),
          this.deleteFlights(
            Object.keys(flights)
              .filter(fId => flights[fId].softDeleted)
              .map(fId => ({ id: fId, persisted: !!flights[fId].remoteFlight }))
          )
        );
      }),
      share()
    );
    saving.subscribe();
    return saving;
  }

  deleteFlights(deletedFlights: { id: string; persisted: boolean }[]): Observable<HalDoc[]> {
    deletedFlights.forEach(({ id }) => this.removeFlight(id));
    const persistedFlights = deletedFlights.filter(({ persisted }) => persisted);
    if (!persistedFlights.length) {
      return of([]);
    }
    return forkJoin(
      persistedFlights.map(({ id }) => {
        return this.campaignService.deleteFlight(id);
      })
    );
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

  removeFlight(flightId: string | number): Observable<CampaignState> {
    const updating = this.campaignFirst$.pipe(
      map(state => {
        const { [flightId]: deletedFlight, ...updatedFlights } = { ...state.flights };
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

  putFlights(): Observable<{ prevId: string; state: FlightState }[]> {
    return this.campaignFirst$.pipe(
      switchMap(state => {
        if (!Object.keys(state.flights).length) {
          return of([]);
        }
        return forkJoin(
          Object.keys(state.flights).map(flightId => {
            return this.campaignService.putFlight(state.flights[flightId]).pipe(
              map((newState: FlightState) => {
                this.loadAvailability(state.flights[flightId].localFlight, flightId);
                return { prevId: flightId, state: newState };
              })
            );
          })
        );
      })
    );
  }
}
