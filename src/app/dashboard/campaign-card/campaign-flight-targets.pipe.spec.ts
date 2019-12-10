import { CampaignFlightTargetsPipe } from './campaign-flight-targets.pipe';
import { flights } from '../dashboard.service.mock';

describe('CampaignFlightTargetsPipe', () => {
  const pipe = new CampaignFlightTargetsPipe();
  it('should display flight targets', () => {
    expect(pipe.transform(flights)).toMatch('LAN, SAD, CA, NYC, NY, CHI, IL, Global');
  });

  it('should de-dup flight targets', () => {
    expect(pipe.transform([...flights, ...flights])).toMatch('LAN, SAD, CA, NYC, NY, CHI, IL, Global');
  });
});
