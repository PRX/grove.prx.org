import { Injectable } from '@angular/core';
import { InventoryService } from '../inventory/inventory.service';
import { CampaignState, Availability } from './campaign.models';
import { Flight } from '../../campaign/store/models';
import { ReplaySubject, Observable, forkJoin, combineLatest } from 'rxjs';
import { map, first, share, withLatestFrom } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import {
  selectRoutedFlightId,
  selectRoutedLocalFlightZones,
  selectRoutedFlightAllocationPreviewEntities
} from '../../campaign/store/selectors';

@Injectable({ providedIn: 'root' })
export class CampaignStoreService {
  // tslint:disable-next-line
  private _state$ = new ReplaySubject<CampaignState>(1);

  get state$(): Observable<CampaignState> {
    return this._state$.asObservable();
  }

  constructor(private store: Store<any>, private inventoryService: InventoryService) {
    this.init();
  }

  init() {
    this._state$.next({ availability: {} });
  }

  getFlightAvailabilityRollup$(): Observable<Availability[]> {
    return combineLatest([
      this.store.pipe(select(selectRoutedFlightId)),
      this.store.pipe(select(selectRoutedLocalFlightZones)),
      this.store.pipe(select(selectRoutedFlightAllocationPreviewEntities)),
      this.state$
    ]).pipe(
      map(([flightId, zones, allocationPreviewEntities, state]) => {
        // availability of current flights
        const availabilityZones =
          zones && zones.filter(zone => state.availability[`${flightId}-${zone}`]).map(zone => state.availability[`${flightId}-${zone}`]);
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
                  allocationPreviewEntities &&
                  allocationPreviewEntities[`${availability.zone}_${day.startDate}`] &&
                  allocationPreviewEntities[`${availability.zone}_${day.startDate}`].goalCount;

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
                  const weekTotals = acc.totals.groups[weekBeginString];
                  acc.totals.groups[weekBeginString] = {
                    // allocated and availability will be null rather than undefined, null + 0 === 0
                    allocated: weekTotals.allocated ? weekTotals.allocated + day.allocated : day.allocated,
                    availability: weekTotals.availability ? weekTotals.availability + day.availability : day.availability,
                    allocationPreview: weekTotals.allocationPreview
                      ? // allocationPreview can be undefined, undefined + 0 === NaN
                        weekTotals.allocationPreview + (day.allocationPreview || 0)
                      : day.allocationPreview,
                    startDate: weekBeginString,
                    endDate: weekEnd.toISOString().slice(0, 10),
                    groups: weekTotals.groups.concat([day])
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

  // the flight.id parameter here will be the temp id in the case the flight has not yet been created
  loadAvailability(flight: Flight): Observable<Availability[]> {
    if (flight.startAt && flight.endAt && flight.set_inventory_uri && flight.zones && flight.zones.length > 0) {
      const startDate = flight.startAt.toISOString().slice(0, 10);
      const endDate = flight.endAt.toISOString().slice(0, 10);
      const inventoryId = flight.set_inventory_uri.split('/').pop();
      const loading = forkJoin(
        flight.zones.map(zoneName => {
          return this.inventoryService.getInventoryAvailability({
            id: inventoryId,
            startDate,
            endDate,
            zone: zoneName,
            ...(flight.createdAt && { flightId: flight.id })
          });
        })
      ).pipe(share());
      loading.pipe(first(), withLatestFrom(this._state$)).subscribe(([availabilities, state]) => {
        const updatedState = {
          ...state,
          availability: {
            ...state.availability,
            ...availabilities.reduce((acc, availability) => ({ ...acc, [`${flight.id}-${availability.zone}`]: availability }), {})
          }
        };
        this._state$.next(updatedState);
      });
      return loading;
    }
  }
}
