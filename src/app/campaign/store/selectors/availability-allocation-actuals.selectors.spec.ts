import * as campaignStateFactory from '../models/campaign-state.factory';
import * as comboSelectors from './availability-allocation-actuals.selectors';
import { AvailabilityRollup } from '../models';
import { selectId as selectAllocationPreviewId } from '../reducers/allocation-preview.reducer';

describe('Availability-Allocation-Actuals Combination Selectors', () => {
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
      campaignStateFactory.flightFixture.zones
    );
    const firstSaturday = withMissingData.findIndex(day => day.date.getUTCDay() === 6);
    expect(rollups[0].weeks[0].numbers.allocationPreview).toEqual(
      withMissingData.slice(0, firstSaturday + 1).reduce((acc, alloc) => (acc += alloc.goalCount), 0)
    );
  });

  it('should roll up into weekly availability and includes allocation preview', () => {
    const rollups: AvailabilityRollup[] = comboSelectors.selectAvailabilityRollup.projector(
      campaignStateFactory.availabilityEntities,
      campaignStateFactory.allocationPreviewEntities,
      campaignStateFactory.flightFixture.id,
      campaignStateFactory.flightFixture.zones
    );
    expect(rollups.length).toEqual(campaignStateFactory.flightFixture.zones.length);
    expect(rollups[0].params).toEqual(campaignStateFactory.availabilityParamsFixture);
    expect(rollups[0].weeks[0].startDate).toEqual(campaignStateFactory.availabilityDaysFixture[0].date);
    expect(new Date(rollups[0].weeks[0].endDate).getUTCDay()).toEqual(6);
    const firstSaturday = campaignStateFactory.availabilityDaysFixture.findIndex(day => day.date.getUTCDay() === 6);
    expect(rollups[0].weeks[0].numbers.availability).toEqual(
      campaignStateFactory.availabilityDaysFixture
        .slice(0, firstSaturday + 1)
        .reduce((acc, avail) => (acc += avail.numbers.availability), 0)
    );
    expect(rollups[0].weeks[0].numbers.allocated).toEqual(
      campaignStateFactory.availabilityDaysFixture.slice(0, firstSaturday + 1).reduce((acc, avail) => (acc += avail.numbers.allocated), 0)
    );
    expect(rollups[0].weeks[0].numbers.allocationPreview).toEqual(
      campaignStateFactory.allocationPreviewFixture.slice(0, firstSaturday + 1).reduce((acc, alloc) => (acc += alloc.goalCount), 0)
    );
    expect(rollups[0].totals.availability).toEqual(
      campaignStateFactory.availabilityDaysFixture.reduce((acc, avail) => (acc += avail.numbers.availability), 0)
    );
    expect(rollups[0].totals.allocated).toEqual(
      campaignStateFactory.availabilityDaysFixture.reduce((acc, avail) => (acc += avail.numbers.allocated), 0)
    );
    expect(rollups[0].totals.allocationPreview).toEqual(
      campaignStateFactory.allocationPreviewFixture.reduce((acc, alloc) => (acc += alloc.goalCount), 0)
    );
  });
});
