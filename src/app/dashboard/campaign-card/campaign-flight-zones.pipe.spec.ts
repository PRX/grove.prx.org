import { CampaignFlightZonesPipe } from './campaign-flight-zones.pipe';
import { flights } from '../dashboard.service.mock';

describe('CampaignFlightZonesPipe', () => {
  const pipe = new CampaignFlightZonesPipe();
  it('should dispay flight zones', () => {
    expect(pipe.transform(flights)).toMatch('Preroll, Midroll');
  });

  it('should de-dup flight zones', () => {
    expect(pipe.transform([...flights, ...flights])).toMatch('Preroll, Midroll');
  });
});
