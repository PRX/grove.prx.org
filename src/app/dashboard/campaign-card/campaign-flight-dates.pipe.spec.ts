import { CampaignFlightDatesPipe } from './campaign-flight-dates.pipe';
import { flights } from '../dashboard.service.mock';

describe('CampaignFlightDatesPipe', () => {
  const pipe = new CampaignFlightDatesPipe();
  it('should display min start and max end dates', () => {
    expect(pipe.transform(flights)).toMatch('9/1 - 9/13');
  });
});
