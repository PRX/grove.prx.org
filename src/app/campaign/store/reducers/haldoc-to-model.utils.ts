import { HalDoc } from 'ngx-prx-styleguide';
import { Campaign } from './campaign.reducer';

const filter = (doc: HalDoc): {} => {
  return Object.keys(doc.asJSON())
    .filter(key => !key.startsWith('_'))
    .reduce((obj, key) => ({ ...obj, [key]: doc[key] }), {});
};

export const docToCampaign = (doc: HalDoc): Campaign => {
  const campaign = filter(doc) as Campaign;
  campaign.set_advertiser_uri = doc.expand('prx:advertiser');
  campaign.set_account_uri = doc.expand('prx:account');
  return campaign;
};
