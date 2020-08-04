import * as campaignStateFactory from '../models/campaign-state.factory';
import * as campaignFlightSelectors from './campaign-flight.selectors';
import { docToFlightDays } from '../models';
import { MockHalDoc } from 'ngx-prx-styleguide';
import moment from 'moment';

describe('Campaign-Flight Selectors', () => {
  it('should select campaign and flight inventory report data', () => {
    const campaignState = campaignStateFactory.createCampaignStoreState();
    const flightDaysState = campaignStateFactory.createFlightDaysState();
    const reportData = campaignFlightSelectors.selectCampaignFlightInventoryReportData.projector(
      campaignState.campaign,
      campaignStateFactory.inventoryFixture,
      campaignStateFactory.advertisersFixture,
      [campaignStateFactory.flightFixture],
      flightDaysState.flightDays.entities
    );
    expect(reportData).toBeDefined();
    expect(reportData.length).toEqual(
      // 0 flight names
      1 +
        // 1 sponsor
        1 +
        // 2 show
        1 +
        // 3 zones
        1 +
        // 4, 5 contract start/end dates
        2 +
        // 6 geo targets
        1 +
        // 7 contract goals
        1 +
        // 8 total actual count
        1 +
        // 9... flight days, simple case (only a single flight in this report)
        flightDaysState.flightDays.entities[campaignStateFactory.flightFixture.id].days.length
    );
    // spot check it
    expect(reportData[0][0]).toEqual('Flight Name');
    expect(reportData[0][1]).toEqual(campaignStateFactory.flightFixture.name);
    expect(reportData[4][0]).toEqual('Start Date');
    expect(reportData[4][1]).toEqual(campaignStateFactory.flightFixture.contractStartAt.format('MM-DD-YYYY'));
    expect(reportData[7][0]).toEqual('Contract Goal');
    expect(reportData[7][1]).toEqual(campaignStateFactory.flightFixture.contractGoal);
    expect(reportData[9][0]).toEqual(
      moment.utc(flightDaysState.flightDays.entities[campaignStateFactory.flightFixture.id].days[0].date).format('MM-DD-YYYY')
    );
    expect(reportData[9][1]).toEqual(flightDaysState.flightDays.entities[campaignStateFactory.flightFixture.id].days[0].numbers.actuals);
  });

  it('should include a report row per unique date in all flights', () => {
    const campaignState = campaignStateFactory.createCampaignStoreState();
    const flightDaysState = campaignStateFactory.createFlightDaysState();
    const flights = [
      campaignStateFactory.flightFixture,
      { ...campaignStateFactory.flightFixture, id: campaignStateFactory.flightFixture.id + 1 }
    ];
    // flight days with an additional flight shifted by 10 days
    const flightDaysEntities = {
      ...flightDaysState.flightDays.entities,
      [campaignStateFactory.flightFixture.id + 1]: docToFlightDays(
        new MockHalDoc(campaignStateFactory.flightDocFixture),
        campaignStateFactory.flightFixture.id,
        campaignStateFactory.flightDaysData.map(day => ({ ...day, date: moment.utc(day.date).add(10, 'days') }))
      )
    };
    const reportData = campaignFlightSelectors.selectCampaignFlightInventoryReportData.projector(
      campaignState.campaign,
      campaignStateFactory.inventoryFixture,
      campaignStateFactory.advertisersFixture,
      flights,
      flightDaysEntities
    );
    expect(reportData.length).toEqual(
      // 0 flight names
      1 +
        // 1 sponsor
        1 +
        // 2 show
        1 +
        // 3 zones
        1 +
        // 4, 5 contract start/end dates
        2 +
        // 6 geo targets
        1 +
        // 7 contract goals
        1 +
        // 8 total actual count
        1 +
        // 9... flight days + 10 days, one flight days set shifted by 10 days
        flightDaysState.flightDays.entities[campaignStateFactory.flightFixture.id].days.length +
        10
    );
    expect(reportData[9][0]).toEqual(
      moment.utc(flightDaysState.flightDays.entities[campaignStateFactory.flightFixture.id].days[0].date).format('MM-DD-YYYY')
    );
    expect(reportData[9][1]).toEqual(flightDaysState.flightDays.entities[campaignStateFactory.flightFixture.id].days[0].numbers.actuals);
    expect(reportData[reportData.length - 1][0]).toEqual(
      moment
        .utc(
          flightDaysState.flightDays.entities[campaignStateFactory.flightFixture.id].days[
            flightDaysState.flightDays.entities[campaignStateFactory.flightFixture.id].days.length - 1
          ].date
        )
        .add(10, 'days')
        .format('MM-DD-YYYY')
    );
    expect(reportData[reportData.length - 1][1]).toEqual('-');
    expect(reportData[reportData.length - 1][2]).toEqual(
      flightDaysState.flightDays.entities[campaignStateFactory.flightFixture.id].days[
        flightDaysState.flightDays.entities[campaignStateFactory.flightFixture.id].days.length - 1
      ].numbers.actuals
    );
  });
});
