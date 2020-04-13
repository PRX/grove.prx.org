import { CampaignCardAbbreviateNumberPipe } from './campaign-card-abbreviate-number.pipe';
import { flights } from '../dashboard.service.mock';

describe('CampaignCardAbbreviateNumberPipe', () => {
  const pipe = new CampaignCardAbbreviateNumberPipe();
  it('should format without suffix', () => {
    expect(pipe.transform(67)).toMatch('67');
  });
  it('should format with suffix', () => {
    expect(pipe.transform(3000)).toMatch('3K');
    expect(pipe.transform(3000000)).toMatch('3M');
    expect(pipe.transform(3000000000)).toMatch('3B');
  });
});
