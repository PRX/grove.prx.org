import { createSelector } from '@ngrx/store';
import {
  Availability,
  AvailabilityWeeklyRollup,
  AvailabilityRollup,
  AllocationPreview,
  AvailabilityParams,
  InventoryNumbers,
  AvailabilityDay
} from '../models';
import { selectRoutedFlightAvailabilityEntities } from './availability.selectors';
import { selectRoutedFlightAllocationPreviewEntities } from './allocation-preview.selectors';
import { selectRoutedFlightId, selectRoutedLocalFlightZones } from './flight.selectors';

export const getAllocationPreviewForDate = (
  dateString: string,
  zone: string,
  allocationPreviewEntities: { [id: string]: AllocationPreview }
): number => {
  if (allocationPreviewEntities && allocationPreviewEntities[`${zone}_${dateString}`]) {
    return allocationPreviewEntities[`${zone}_${dateString}`].goalCount;
  }
};

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

export const initWeeklyData = (showAvailability: boolean, day: AvailabilityDay, endOfWeek: Date): AvailabilityWeeklyRollup => {
  // initialize weekly entry with week boundaries and day 0 values
  return {
    startDate: day.date,
    endDate: endOfWeek,
    numbers: {
      ...day.numbers,
      availability: showAvailability ? day.numbers.availability + day.numbers.allocated : 0
    },
    days: [
      {
        ...day,
        numbers: {
          ...day.numbers,
          availability: showAvailability ? day.numbers.availability + day.numbers.allocated : 0
        }
      }
    ]
  };
};

export const accumulateOntoWeekly = (
  showAvailability: boolean,
  weekly: AvailabilityWeeklyRollup,
  day: AvailabilityDay
): AvailabilityWeeklyRollup => {
  const sum = (a: number, b: number) => (b ? b + (a || 0) : a);
  return {
    ...weekly,
    numbers: {
      // allocated and availability will be null rather than undefined, null + 0 === 0
      allocated: sum(day.numbers.allocated, weekly.numbers.allocated),
      availability: showAvailability ? sum(day.numbers.availability + day.numbers.allocated, weekly.numbers.availability) : 0,
      actuals: sum(day.numbers.actuals, weekly.numbers.actuals),
      allocationPreview: sum(day.numbers.allocationPreview, weekly.numbers.allocationPreview)
    },
    days: weekly.days.concat([
      {
        ...day,
        numbers: {
          ...day.numbers,
          availability: showAvailability ? day.numbers.availability + day.numbers.allocated : 0
        }
      }
    ])
  };
};

// Each week's data is keyed by a date string of beginning of each week's date. The days are accumulated onto it.
export const rollupWeeks = (
  availability: Availability,
  allocationPreviewEntities: { [id: string]: AllocationPreview }
): { params: AvailabilityParams; totals: InventoryNumbers; weeks: { [weekDate: string]: AvailabilityWeeklyRollup } } => {
  let beginOfWeek: string;
  let endOfWeek: Date;
  // reduce to acc weeks
  return availability.days.reduce(
    (acc, day) => {
      // get the day's allocationPreview from the allocationPreviewEntities which are keyed by `zone_date`
      day.numbers.allocationPreview = getAllocationPreviewForDate(
        getDateSlice(day.date),
        availability.params.zone,
        allocationPreviewEntities
      );

      // will zero out availability if date is in the past
      const showAvailability = getMidnightUTC(day.date) >= getMidnightUTC(new Date());

      // if day.date has passed into the next week (past prior endOfWeek)
      if (!endOfWeek || endOfWeek.valueOf() <= day.date.valueOf()) {
        // initial data and begin and end of week
        beginOfWeek = getDateSlice(day.date);
        endOfWeek = getEndOfWeek(day.date);
        acc.weeks[beginOfWeek] = initWeeklyData(showAvailability, day, endOfWeek);
      } else {
        // accumulate values onto week until it passes next week boundary
        acc.weeks[beginOfWeek] = accumulateOntoWeekly(showAvailability, acc.weeks[beginOfWeek], day);
      }
      // accumulate days onto totals
      acc.totals.allocated += day.numbers.allocated;
      if (showAvailability) {
        acc.totals.availability += day.numbers.availability + day.numbers.allocated;
      }
      acc.totals.actuals += day.numbers.actuals;
      acc.totals.allocationPreview += day.numbers.allocationPreview;
      return acc;
    },
    {
      params: availability.params,
      weeks: {},
      totals: {
        allocated: 0,
        availability: 0,
        actuals: 0,
        allocationPreview: 0
      }
    }
  );
};

export const selectAvailabilityRollup = createSelector(
  selectRoutedFlightAvailabilityEntities,
  selectRoutedFlightAllocationPreviewEntities,
  selectRoutedFlightId,
  selectRoutedLocalFlightZones,
  (availabilityEntities, allocationPreviewEntities, flightId, zones): AvailabilityRollup[] => {
    // filter availability entities by routed flight zones
    const availabilityZones =
      zones && zones.filter(zone => availabilityEntities[`${flightId}_${zone}`]).map(zone => availabilityEntities[`${flightId}_${zone}`]);

    // group each zone by weeks
    const zoneWeeks =
      availabilityZones && availabilityZones.map((availability: Availability) => rollupWeeks(availability, allocationPreviewEntities));

    // map weekly acc keys to array and sort by date
    return (
      zoneWeeks &&
      zoneWeeks.map(zw => {
        const { params, totals, weeks } = zw;
        return {
          params,
          totals,
          weeks: Object.keys(weeks)
            .map(w => weeks[w])
            .sort((a, b) => a.startDate.valueOf() - b.startDate.valueOf()) as AvailabilityWeeklyRollup[]
        };
      })
    );
  }
);
