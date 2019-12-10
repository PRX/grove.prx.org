import { CampaignListTotalPagesPipe } from './campaign-list-total-pages.pipe';

describe('CampaignListTotalPagesPipe', () => {
  const pipe = new CampaignListTotalPagesPipe();
  it('should return total pages', () => {
    expect(pipe.transform({total: 20, per: 9})).toEqual(3);
  });
});
