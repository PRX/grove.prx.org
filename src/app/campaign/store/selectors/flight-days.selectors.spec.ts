import { MockHalDoc } from 'ngx-prx-styleguide';
import * as campaignStateFactory from '../models/campaign-state.factory';
import * as fromFlightDays from './flight-days.selectors';
import { InventoryRollup, docToFlightDays, getFlightDaysId } from '../models';
import * as moment from 'moment';

describe('Flight Days/Preview Selectors', () => {
  const flightDaysState = campaignStateFactory.createFlightDaysState().flightDays;

  it('should roll up into weekly and only include availability from current date forward', () => {
    const rollup: InventoryRollup = fromFlightDays.selectFlightDaysRollup.projector(
      docToFlightDays(
        new MockHalDoc(campaignStateFactory.flightDocFixture),
        campaignStateFactory.flightDocFixture.id,
        campaignStateFactory.flightDaysDocFixture
      )
    );

    // AVAILABLE
    // data is 15 days back and 15 days ahead including today
    // check the last week of data
    const beginningOfLastWeek =
      campaignStateFactory.flightDaysData.length -
      (1 +
        campaignStateFactory.flightDaysData
          .slice()
          .reverse()
          .findIndex(day => moment.utc(day.date).day() === 0));
    expect(rollup.weeks[rollup.weeks.length - 1].numbers.available).toEqual(
      campaignStateFactory.flightDaysData.slice(beginningOfLastWeek).reduce((acc, days) => (acc += days.available + days.allocated), 0)
    );
    // totals
    expect(rollup.totals.available).toEqual(
      campaignStateFactory.flightDaysData
        .slice(campaignStateFactory.flightDaysData.findIndex(days => new Date(days.date).valueOf() > Date.now()) - 1)
        .reduce((acc, days) => (acc += days.available + days.allocated), 0)
    );

    // ALLOCATED/ACTUAL
    // check the first week for allocated/actuals/allocationPreview
    const endOfFirstWeek = campaignStateFactory.flightDaysData.findIndex(day => moment.utc(day.date).day() === 6);
    expect(rollup.weeks[0].numbers.allocated).toEqual(
      campaignStateFactory.flightDaysData.slice(0, endOfFirstWeek + 1).reduce((acc, day) => (acc += day.allocated), 0)
    );
    expect(rollup.weeks[0].numbers.actuals).toEqual(
      campaignStateFactory.flightDaysData.slice(0, endOfFirstWeek + 1).reduce((acc, day) => (acc += day.actuals), 0)
    );
    expect(rollup.weeks[0].numbers.inventory).toEqual(
      campaignStateFactory.flightDaysData.slice(0, endOfFirstWeek + 1).reduce((acc, day) => (acc += day.inventory), 0)
    );
    // totals
    expect(rollup.totals.allocated).toEqual(campaignStateFactory.flightDaysData.reduce((acc, day) => (acc += day.allocated), 0));
    expect(rollup.totals.actuals).toEqual(campaignStateFactory.flightDaysData.reduce((acc, day) => (acc += day.actuals), 0));
    expect(rollup.totals.inventory).toEqual(campaignStateFactory.flightDaysData.reduce((acc, day) => (acc += day.inventory), 0));
  });

  it('should initialize weekly data with first daily entry summing the availability and allocated amounts into availability', () => {
    const flightDay = flightDaysState.entities[getFlightDaysId(flightDaysState.entities[Object.keys(flightDaysState.entities)[0]])].days[0];
    expect(fromFlightDays.initWeeklyData(true, flightDay, fromFlightDays.getEndOfWeek(flightDay.date)).numbers.available).toEqual(
      flightDay.numbers.allocated + flightDay.numbers.available
    );
    expect(fromFlightDays.initWeeklyData(false, flightDay, fromFlightDays.getEndOfWeek(flightDay.date)).numbers.available).toBeNull();
  });

  it('should accumulate daily numbers onto weekly rollups', () => {
    const flightDay0 =
      flightDaysState.entities[getFlightDaysId(flightDaysState.entities[Object.keys(flightDaysState.entities)[0]])].days[0];
    const flightDay1 =
      flightDaysState.entities[getFlightDaysId(flightDaysState.entities[Object.keys(flightDaysState.entities)[0]])].days[1];
    const weeklyRollup = fromFlightDays.initWeeklyData(true, flightDay0, fromFlightDays.getEndOfWeek(flightDay0.date));
    expect(fromFlightDays.accumulateOntoWeekly(true, weeklyRollup, flightDay1).numbers.available).toEqual(
      flightDay0.numbers.allocated + flightDay0.numbers.available + flightDay1.numbers.allocated + flightDay1.numbers.available
    );
    expect(fromFlightDays.accumulateOntoWeekly(false, weeklyRollup, flightDay1).numbers.available).toBeNull();
  });

  it('should get midnight UTC value for a given date', () => {
    expect(new Date(fromFlightDays.getMidnightUTC(new Date())).getUTCHours()).toEqual(0);
    expect(new Date(fromFlightDays.getMidnightUTC(new Date())).getUTCMinutes()).toEqual(0);
    expect(new Date(fromFlightDays.getMidnightUTC(new Date())).getUTCSeconds()).toEqual(0);
    expect(new Date(fromFlightDays.getMidnightUTC(new Date())).getUTCMilliseconds()).toEqual(0);
  });

  it('should get the end of the week for a given date', () => {
    expect(fromFlightDays.getEndOfWeek(new Date()).getUTCDay()).toEqual(6);
    expect(fromFlightDays.getEndOfWeek(new Date()).getUTCHours()).toEqual(23);
    expect(fromFlightDays.getEndOfWeek(new Date()).getUTCMinutes()).toEqual(59);
    expect(fromFlightDays.getEndOfWeek(new Date()).getUTCSeconds()).toEqual(59);
    expect(fromFlightDays.getEndOfWeek(new Date()).getUTCMilliseconds()).toEqual(999);
  });

  it('should get a UTC date string from a Date', () => {
    expect(fromFlightDays.getDateSlice(new Date())).toEqual(
      `${new Date().getUTCFullYear()}-${('0' + (new Date().getUTCMonth() + 1)).slice(-2)}-${('0' + new Date().getUTCDate()).slice(-2)}`
    );
  });
});
