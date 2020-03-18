import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';

export interface Campaign {
  id?: number;
  name: string;
  type: string;
  status: string;
  repName: string;
  notes: string;
  createdAt?: Date;
  set_account_uri: string;
  set_advertiser_uri: string;
}

export interface CampaignState {
  doc?: HalDoc;
  localCampaign: Campaign;
  remoteCampaign?: Campaign;
  changed: boolean;
  valid: boolean;
  loading: boolean;
  loaded: boolean;
  saving: boolean;
  error?: any;
}

export const docToCampaign = (doc: HalDoc): Campaign => {
  const campaign = filterUnderscores(doc) as Campaign;
  campaign.createdAt = new Date(campaign.createdAt);
  campaign.set_advertiser_uri = doc.expand('prx:advertiser');
  campaign.set_account_uri = doc.expand('prx:account');
  return campaign;
};
