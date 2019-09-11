import { CampaignService, Campaign } from './campaign.service';
import { MockHalService } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';

// TODO: styleguide doesn't export HalHttpError class
class Mock404Error extends Error {
  status = 404;
  constructor() {
    super('');
  }
}

describe('CampaignService', () => {
  let augury: MockHalService;
  let campaign: CampaignService;
  let campaignFixture: Campaign;

  beforeEach(() => {
    augury = new MockHalService();
    campaign = new CampaignService(new AuguryService(<any>augury));
    campaignFixture = {
      id: 1,
      name: 'my campaign name',
      type: 'paid_campaign',
      status: 'draft',
      repName: 'my rep name',
      notes: 'my notes',
      set_account_uri: '/some/account',
      set_advertiser_uri: '/some/advertiser'
    };
  });

  it('gets a campaign', done => {
    const { set_account_uri, set_advertiser_uri, ...campaignProperties } = campaignFixture;
    augury.mock('prx:campaign', {
      ...campaignProperties,
      _links: { 'prx:account': { href: set_account_uri }, 'prx:advertiser': { href: set_advertiser_uri } }
    });
    campaign.getCampaign(1).subscribe(camp => {
      expect(camp).toMatchObject({ ...campaignFixture });
      done();
    });
  });

  it('gets null for blank ids', done => {
    campaign.getCampaign(null).subscribe(camp => {
      expect(camp).toBeNull();
      done();
    });
  });

  it('gets null for nonexistent campaign', done => {
    augury.mockError('prx:campaign', new Mock404Error());
    campaign.getCampaign(1).subscribe(camp => {
      expect(camp).toBeNull();
      done();
    });
  });

  it('creates new campaigns', done => {
    delete campaignFixture.id;
    const spy = jest.spyOn(augury.root, 'create');
    campaign.putCampaign(campaignFixture).subscribe(camp => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toEqual('prx:campaign');
      expect(spy.mock.calls[0][2]).toMatchObject(campaignFixture);
      done();
    });
  });

  it('updates existing campaigns', done => {
    const doc = augury.mock('prx:campaign', { any: 'thing' });
    const spy = jest.spyOn(doc, 'update');
    campaign.putCampaign(campaignFixture).subscribe(camp => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toMatchObject(campaignFixture);
      done();
    });
  });
});
