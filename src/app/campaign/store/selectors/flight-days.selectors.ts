import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '../';
import { selectCampaignStoreState } from './campaign.selectors';
import { FlightDay, FlightDays, InventoryNumbers, InventoryRollup, InventoryWeeklyRollup } from '../models';
import { selectIds, selectEntities, selectAll } from '../reducers/flight-days.reducer';
import { selectRoutedFlightId } from './flight.selectors';

export const selectFlightDaysState = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.flightDays);
export const selectFlightDaysIds = createSelector(selectFlightDaysState, selectIds);
export const selectFlightDaysEntities = createSelector(selectFlightDaysState, selectEntities);
export const selectAllFlightDays = createSelector(selectFlightDaysState, selectAll);

export const selectRoutedFlightDays = createSelector(
  selectFlightDaysEntities,
  selectRoutedFlightId,
  (flightDays, id): FlightDays => {
    return flightDays && flightDays[id];
  }
);

export const selectIsFlightPreview = createSelector(selectRoutedFlightDays, (state): boolean => state && state.preview);
export const selectIsFlightPreviewLoading = createSelector(selectRoutedFlightDays, (state): boolean => state && state.loading);
export const selectRoutedFlightPreviewError = createSelector(selectRoutedFlightDays, state => state && state.previewError);

export const getMidnightUTC = (date: Date): number => {
  return date.valueOf() - (date.valueOf() % (24 * 60 * 60 * 1000));
};

export const getEndOfWeek = (date: Date): Date => {
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));
  return end;
};

export const getDateSlice = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

export const initWeeklyData = (showAvailable: boolean, day: FlightDay, endOfWeek: Date): InventoryWeeklyRollup => {
  // initialize weekly entry with week boundaries and day 0 values
  return {
    startDate: day.date,
    endDate: endOfWeek,
    numbers: {
      ...day.numbers,
      available: showAvailable ? day.numbers.available + day.numbers.allocated : 0
    },
    days: [
      {
        ...day,
        numbers: {
          ...day.numbers,
          available: showAvailable ? day.numbers.available + day.numbers.allocated : 0
        }
      }
    ]
  };
};

export const accumulateOntoWeekly = (showAvailable: boolean, weekly: InventoryWeeklyRollup, day: FlightDay): InventoryWeeklyRollup => {
  const sum = (a: number, b: number) => (b ? b + (a || 0) : a);
  return {
    ...weekly,
    numbers: {
      available: showAvailable ? sum(day.numbers.available + day.numbers.allocated, weekly.numbers.available) : 0,
      allocated: sum(day.numbers.allocated, weekly.numbers.allocated),
      actuals: sum(day.numbers.actuals, weekly.numbers.actuals),
      inventory: sum(day.numbers.inventory, weekly.numbers.inventory)
    },
    days: weekly.days.concat([
      {
        ...day,
        numbers: {
          ...day.numbers,
          available: showAvailable ? day.numbers.available + day.numbers.allocated : 0
        }
      }
    ])
  };
};

// Each week's data is keyed by a date string of beginning of each week's date. The days are accumulated onto it.
export const rollupWeeks = (inventory: FlightDay[]): { totals: InventoryNumbers; weeks: InventoryWeeklyRollup[] } => {
  let beginOfWeek: string;
  let endOfWeek: Date;
  // reduce to accumulate the weekly rollups
  const rollups = inventory.reduce(
    (acc, day) => {
      // will zero out available if date is in the past
      const showAvailable = getMidnightUTC(day.date) >= getMidnightUTC(new Date());

      // if day.date has passed into the next week (past prior endOfWeek)
      if (!endOfWeek || endOfWeek.valueOf() <= day.date.valueOf()) {
        // initial data and begin and end of week
        beginOfWeek = getDateSlice(day.date);
        endOfWeek = getEndOfWeek(day.date);
        acc.weeks[beginOfWeek] = initWeeklyData(showAvailable, day, endOfWeek);
      } else {
        // accumulate values onto week until it passes next week boundary
        acc.weeks[beginOfWeek] = accumulateOntoWeekly(showAvailable, acc.weeks[beginOfWeek], day);
      }
      // accumulate days onto totals
      if (showAvailable) {
        acc.totals.available += day.numbers.available + day.numbers.allocated;
      }
      acc.totals.allocated += day.numbers.allocated;
      acc.totals.actuals += day.numbers.actuals;
      acc.totals.inventory += day.numbers.inventory;
      return acc;
    },
    {
      weeks: {} as { [weekDate: string]: InventoryWeeklyRollup },
      totals: {
        available: 0,
        allocated: 0,
        actuals: 0,
        inventory: 0
      }
    }
  );

  return {
    weeks: Object.values(rollups.weeks).sort((a, b) => a.startDate.valueOf() - b.startDate.valueOf()),
    totals: rollups.totals
  };
};

export const selectFlightDaysRollup = createSelector(
  selectRoutedFlightDays,
  (flightDays): InventoryRollup => {
    return flightDays && flightDays.days && rollupWeeks(flightDays.days);
  }
);
