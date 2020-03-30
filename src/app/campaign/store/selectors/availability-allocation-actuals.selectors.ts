import { createSelector } from '@ngrx/store';
import { Availability, AvailabilityWeeklyRollup, AvailabilityRollup } from '../models';
import { selectRoutedFlightAvailabilityEntities } from './availability.selectors';
import { selectRoutedFlightAllocationPreviewEntities } from './allocation-preview.selectors';
import { selectRoutedFlightId, selectRoutedLocalFlightZones } from './flight.selectors';

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
      availabilityZones &&
      availabilityZones.map((availability: Availability) => {
        // Each week is keyed by a date string of the week begin date. The days are accumulated onto it.
        let weekBeginString: string;
        let weekEnd: Date;
        // reduce to acc weeks
        return availability.days.reduce(
          (acc, day) => {
            // get the day's allocationPreview from the allocationPreviewEntities which are keyed by `zone_date`
            const dayDate = day.date.toISOString().slice(0, 10);
            if (allocationPreviewEntities && allocationPreviewEntities[`${availability.params.zone}_${dayDate}`]) {
              day.numbers.allocationPreview = allocationPreviewEntities[`${availability.params.zone}_${dayDate}`].goalCount;
            }

            // if dayDate has passed into the next week (past prior weekEnd)
            if (!weekEnd || weekEnd.valueOf() <= day.date.valueOf()) {
              // find the week boundaries
              weekBeginString = dayDate;
              weekEnd = new Date(Date.UTC(day.date.getUTCFullYear(), day.date.getUTCMonth(), day.date.getUTCDate(), 23, 59, 59));
              weekEnd.setUTCDate(weekEnd.getUTCDate() + (6 - weekEnd.getUTCDay()));

              // initialize weekly entry with week boundaries and day 0 values
              acc.weeks[weekBeginString] = {};
              acc.weeks[weekBeginString].startDate = day.date;
              acc.weeks[weekBeginString].endDate = weekEnd;
              acc.weeks[weekBeginString].numbers = {
                allocated: day.numbers.allocated,
                availability: day.numbers.availability,
                actuals: day.numbers.actuals,
                allocationPreview: day.numbers.allocationPreview
              };
              acc.weeks[weekBeginString].days = [day];
            } else {
              // accumulate values onto week until it passes next week boundary
              const sums = acc.weeks[weekBeginString].numbers;
              acc.weeks[weekBeginString].numbers = {
                // allocated and availability will be null rather than undefined, null + 0 === 0
                allocated: sums.allocated ? sums.allocated + day.numbers.allocated : day.numbers.allocated,
                availability: sums.availability ? sums.availability + day.numbers.availability : day.numbers.availability,
                actuals: sums.actuals ? sums.actuals + day.numbers.actuals : day.numbers.actuals,
                allocationPreview: sums.allocationPreview
                  ? // allocationPreview can be undefined, undefined + 0 === NaN
                    sums.allocationPreview + (day.numbers.allocationPreview || 0)
                  : day.numbers.allocationPreview
              };
              acc.weeks[weekBeginString].days = acc.weeks[weekBeginString].days.concat([day]);
            }
            // accumulate days onto totals
            acc.totals.allocated += day.numbers.allocated;
            acc.totals.availability += day.numbers.availability;
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
      });

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
