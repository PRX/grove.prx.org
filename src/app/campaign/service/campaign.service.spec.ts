import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { MockHalService, HalService, MockHalDoc, HalObservable } from 'ngx-prx-styleguide';
import { AuguryService } from '../../core/augury.service';
import { CampaignService } from './campaign.service';
import { CampaignServiceMock } from './campaign.service.mock';
import { CampaignModel } from '../../shared/model/campaign.model';

describe('CampaignService', () => {
  let auguryService: AuguryService;
  let campaignService: CampaignService;
  const mockAuguryService = new MockHalService();
  const campaignMock = new CampaignServiceMock(mockAuguryService);
  let mockCampaigns: CampaignModel[];

  campaignMock.campaigns.subscribe(campaigns => {
    mockCampaigns = campaigns;
    mockAuguryService.mockItems('prx:campaigns', campaigns.map(a => a.doc));
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuguryService,
        CampaignService,
        {
          provide: HalService,
          useValue: mockAuguryService
        }
      ],
    });

    auguryService = TestBed.get(AuguryService);
    campaignService = TestBed.get(CampaignService);
  });

  it('should load campaigns', (done) => {
    campaignService.campaigns.subscribe(advertisers => {
      expect(advertisers.length).toEqual(mockCampaigns.length);
      expect(advertisers[0].name).toEqual(mockCampaigns[0].name);
      done();
    });
  });

  it('should find a campaign by id', (done) => {
    campaignService.findCampaignById(1).subscribe(campaign => {
      expect(campaign.name).toEqual(mockCampaigns.find(c => c.id === 1).name);
      done();
    });
  });

  it('should make a request for campaign if not found in state', (done) => {
    mockAuguryService.mock('prx:campaign', {
      id: 4,
      name: 'Newest Campaign',
      status: 'sold',
      type: 'paid_campaign'
    });
    jest.spyOn(auguryService, 'follow').mockImplementation(() => of(new MockHalDoc({})) as HalObservable<any>);
    campaignService.findCampaignById(4).subscribe(campaign => {
      expect(auguryService.follow).toHaveBeenCalled();
      // TODO: it's as if the mockAuguryService.mock('prx:campaign') is returning empty doc
      // expect(campaign.name).toEqual('Newest Campaign');
      done();
    });
  });

  it('should save new campaign records', (done) => {
    const newCampaign = new CampaignModel(mockAuguryService.root, new MockHalDoc({
      id: 4,
      name: 'Newest Campaign',
      status: 'sold',
      type: 'paid_campaign'
    }));
    campaignService.save(newCampaign).pipe(
      withLatestFrom(campaignService.campaigns)
    ).subscribe(([, campaigns]) => {
      expect(campaigns.find(a => a.id === 4)).toEqual(newCampaign);
      done();
    });
  });

  it('should save changes to existing records', (done) => {
    const updatedCampaign = new CampaignModel(mockAuguryService.root, new MockHalDoc({
      id: 1,
      name: 'New Campaign',
      status: 'sold',
      type: 'paid_campaign'
    }));
    campaignService.save(updatedCampaign).pipe(
      withLatestFrom(campaignService.campaigns)
    ).subscribe(([, campaigns]) => {
      expect(campaigns.find(a => a.id === 1)).toEqual(updatedCampaign);
      done();
    });
  });

  it('should handle errors on load', (done) => {
    mockAuguryService.mockError('prx:campaigns', 'Bad Request');
    campaignService.loadCampaigns();
    campaignService.campaigns.subscribe((campaigns) => {
      expect(campaigns.length).toEqual(mockCampaigns.length);
      expect(campaignService.error).toEqual(new Error('Bad Request'));
      done();
    });
  });
});
