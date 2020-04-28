import * as campaignStateFactory from '../models/campaign-state.factory';
import * as comboSelectors from './availability-allocation-actuals.selectors';
import { AvailabilityRollup } from '../models';
import { selectId as selectAllocationPreviewId } from '../reducers/allocation-preview.reducer';
import { selectId as selectAvailabilityId } from '../reducers/availability.reducer';
import * as moment from 'moment';

describe('Availability-Allocation-Actuals Combination Selectors', () => {
  const allocationPreviewState = campaignStateFactory.createAllocationPreviewState().allocationPreview;
  it('should look up allocation preview by entity key', () => {
    expect(
      comboSelectors.getAllocationPreviewForDate(
        new Date().toISOString().slice(0, 10),
        allocationPreviewState.zones[0].id,
        allocationPreviewState.entities
      )
    ).toBeDefined();
    // remove first entry to select from entities with missingData
    const missingDataKey = Object.keys(allocationPreviewState.entities)[0];
    const { [missingDataKey]: missingData, ...withMissingData } = allocationPreviewState.entities;
    expect(
      comboSelectors.getAllocationPreviewForDate(
        allocationPreviewState.entities[Object.keys(allocationPreviewState.entities)[0]].date.toISOString().slice(0, 10),
        allocationPreviewState.zones[0].id,
        withMissingData
      )
    ).toBeUndefined();
  });

  it('should ignore missing allocation preview data', () => {
    // remove day 1 from entities
    const withMissingData = campaignStateFactory.allocationPreviewFixture
      .slice(0, 1)
      .concat(campaignStateFactory.allocationPreviewFixture.slice(2));
    const entities = withMissingData.reduce((acc, data) => ({ ...acc, [selectAllocationPreviewId(data)]: data }), {});
    const rollups: AvailabilityRollup[] = comboSelectors.selectAvailabilityRollup.projector(
      campaignStateFactory.availabilityEntities,
      entities,
      campaignStateFactory.flightFixture.id,
      campaignStateFactory.flightFixture.zones.map(z => z.id)
    );
    const firstSaturday = withMissingData.findIndex(day => day.date.getUTCDay() === 6);
    expect(rollups[0].weeks[0].numbers.allocationPreview).toEqual(
      withMissingData.slice(0, firstSaturday + 1).reduce((acc, alloc) => (acc += alloc.goalCount), 0)
    );
  });

  it('should roll up into weekly availability+allocated and only include availability from current date forward', () => {
    const rollups: AvailabilityRollup[] = comboSelectors.selectAvailabilityRollup.projector(
      campaignStateFactory.availabilityEntities,
      campaignStateFactory.allocationPreviewEntities,
      campaignStateFactory.flightFixture.id,
      campaignStateFactory.flightFixture.zones.map(z => z.id)
    );

    // data is 15 days back and 15 days ahead including today
    // check the last week of data
    const beginningOfLastWeek =
      campaignStateFactory.availabilityDaysFixture.length -
      (1 +
        campaignStateFactory.availabilityDaysFixture
          .slice()
          .reverse()
          .findIndex(day => moment.utc(day.date).day() === 0));
    expect(rollups[0].weeks[rollups[0].weeks.length - 1].numbers.availability).toEqual(
      campaignStateFactory.availabilityDaysFixture
        .slice(beginningOfLastWeek)
        .reduce((acc, avail) => (acc += avail.numbers.availability + avail.numbers.allocated), 0)
    );
    expect(rollups[0].totals.availability).toEqual(
      campaignStateFactory.availabilityDaysFixture
        .slice(campaignStateFactory.availabilityDaysFixture.findIndex(avail => new Date(avail.date).valueOf() > Date.now()) - 1)
        .reduce((acc, avail) => (acc += avail.numbers.availability + avail.numbers.allocated), 0)
    );
  });

  it('should roll up into weekly inventory and include allocation preview', () => {
    const rollups: AvailabilityRollup[] = comboSelectors.selectAvailabilityRollup.projector(
      campaignStateFactory.availabilityEntities,
      campaignStateFactory.allocationPreviewEntities,
      campaignStateFactory.flightFixture.id,
      campaignStateFactory.flightFixture.zones.map(z => z.id)
    );
    expect(rollups.length).toEqual(campaignStateFactory.flightFixture.zones.length);
    expect(rollups[0].params).toEqual(campaignStateFactory.availabilityParamsFixture);
    expect(rollups[0].weeks[0].startDate).toEqual(campaignStateFactory.availabilityDaysFixture[0].date);
    expect(new Date(rollups[0].weeks[0].endDate).getUTCDay()).toEqual(6);

    // check the first week for allocated/actuals/allocationPreview
    const endOfFirstWeek = campaignStateFactory.availabilityDaysFixture.findIndex(day => moment.utc(day.date).day() === 6);
    expect(rollups[0].weeks[0].numbers.allocated).toEqual(
      campaignStateFactory.availabilityDaysFixture.slice(0, endOfFirstWeek + 1).reduce((acc, avail) => (acc += avail.numbers.allocated), 0)
    );
    expect(rollups[0].weeks[0].numbers.actuals).toEqual(
      campaignStateFactory.availabilityDaysFixture.slice(0, endOfFirstWeek + 1).reduce((acc, avail) => (acc += avail.numbers.actuals), 0)
    );
    expect(rollups[0].weeks[0].numbers.allocationPreview).toEqual(
      campaignStateFactory.allocationPreviewFixture.slice(0, endOfFirstWeek + 1).reduce((acc, alloc) => (acc += alloc.goalCount), 0)
    );

    expect(rollups[0].totals.allocated).toEqual(
      campaignStateFactory.availabilityDaysFixture.reduce((acc, avail) => (acc += avail.numbers.allocated), 0)
    );
    expect(rollups[0].totals.actuals).toEqual(
      campaignStateFactory.availabilityDaysFixture.reduce((acc, avail) => (acc += avail.numbers.actuals), 0)
    );
    expect(rollups[0].totals.allocationPreview).toEqual(
      campaignStateFactory.allocationPreviewFixture.reduce((acc, alloc) => (acc += alloc.goalCount), 0)
    );
  });

  it('should initialize weekly data with first daily entry summing the availability and allocated amounts into availability', () => {
    const availabilityState = campaignStateFactory.createAvailabilityState().availability;
    const availabilityDay =
      availabilityState.entities[selectAvailabilityId(availabilityState.entities[Object.keys(availabilityState.entities)[0]])].days[0];
    expect(
      comboSelectors.initWeeklyData(true, availabilityDay, comboSelectors.getEndOfWeek(allocationPreviewState.startAt)).numbers.availability
    ).toEqual(availabilityDay.numbers.allocated + availabilityDay.numbers.availability);
    expect(
      comboSelectors.initWeeklyData(false, availabilityDay, comboSelectors.getEndOfWeek(allocationPreviewState.startAt)).numbers
        .availability
    ).toEqual(0);
  });

  it('should accumulate daily numbers onto weekly rollups', () => {
    const availabilityState = campaignStateFactory.createAvailabilityState().availability;
    const availabilityDay0 =
      availabilityState.entities[selectAvailabilityId(availabilityState.entities[Object.keys(availabilityState.entities)[0]])].days[0];
    const availabilityDay1 =
      availabilityState.entities[selectAvailabilityId(availabilityState.entities[Object.keys(availabilityState.entities)[0]])].days[1];
    const weeklyRollup = comboSelectors.initWeeklyData(true, availabilityDay0, comboSelectors.getEndOfWeek(allocationPreviewState.startAt));
    expect(comboSelectors.accumulateOntoWeekly(true, weeklyRollup, availabilityDay1).numbers.availability).toEqual(
      availabilityDay0.numbers.allocated +
        availabilityDay0.numbers.availability +
        availabilityDay1.numbers.allocated +
        availabilityDay1.numbers.availability
    );
    expect(comboSelectors.accumulateOntoWeekly(false, weeklyRollup, availabilityDay1).numbers.availability).toEqual(0);
  });

  it('should get midnight UTC value for a given date', () => {
    expect(new Date(comboSelectors.getMidnightUTC(new Date())).getUTCHours()).toEqual(0);
    expect(new Date(comboSelectors.getMidnightUTC(new Date())).getUTCMinutes()).toEqual(0);
    expect(new Date(comboSelectors.getMidnightUTC(new Date())).getUTCSeconds()).toEqual(0);
    expect(new Date(comboSelectors.getMidnightUTC(new Date())).getUTCMilliseconds()).toEqual(0);
  });

  it('should get the end of the week for a given date', () => {
    expect(comboSelectors.getEndOfWeek(new Date()).getUTCDay()).toEqual(6);
    expect(comboSelectors.getEndOfWeek(new Date()).getUTCHours()).toEqual(23);
    expect(comboSelectors.getEndOfWeek(new Date()).getUTCMinutes()).toEqual(59);
    expect(comboSelectors.getEndOfWeek(new Date()).getUTCSeconds()).toEqual(59);
    expect(comboSelectors.getEndOfWeek(new Date()).getUTCMilliseconds()).toEqual(999);
  });

  it('should get a UTC date string from a Date', () => {
    expect(comboSelectors.getDateSlice(new Date())).toEqual(
      `${new Date().getUTCFullYear()}-${('0' + (new Date().getUTCMonth() + 1)).slice(-2)}-${('0' + new Date().getUTCDate()).slice(-2)}`
    );
  });
});
