import { GeoTargetsPipe } from './geo-targets.pipe';
import { flights } from '../../dashboard/dashboard.service.mock';

describe('GeoTargetsPipe', () => {
  const pipe = new GeoTargetsPipe();
  it('should display geo targets and ignore other targets', () => {
    expect(
      pipe.transform([
        { type: 'country', code: 'CA', label: 'Canada' },
        { type: 'country', code: 'US', label: 'United States of America' },
        { type: 'metro', code: '1', label: 'LAN' },
        { type: 'metro', code: '2', label: 'SAD' },
        { type: 'metro', code: '3', label: 'NYC' },
        { type: 'metro', code: '4', label: 'CHI' },
        { type: 'subdiv', code: 'IN', label: 'Indiana' },
        { type: 'episode', code: '22222222-2222-2222-2222-222222222222', label: '22222222-2222-2222-2222-222222222222' }
      ])
    ).toMatch('CA, US, LAN, SAD, NYC, CHI, Indiana');
  });
});
