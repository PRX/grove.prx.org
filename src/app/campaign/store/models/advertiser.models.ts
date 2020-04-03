import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';

export interface Advertiser {
  id: number;
  name: string;
  set_advertiser_uri: string;
}

export const docToAdvertiser = (doc: HalDoc): Advertiser => {
  const advertiser = filterUnderscores(doc) as Advertiser;
  advertiser.set_advertiser_uri = doc.expand('self');
  return advertiser;
};
