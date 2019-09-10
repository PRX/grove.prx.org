import { CampaignFlightTargetsPipe } from './campaign-flight-targets.pipe';
import { flights } from '../campaign-list.service.mock';

describe('CampaignFlightTargetsPipe', () => {
  const pipe = new CampaignFlightTargetsPipe();
  it ('should display flight targets', () => {
    expect(pipe.transform(flights)).toMatch('LAN, SAD, CA, NYC, NY, CHI, IL, Global');
  });
});
