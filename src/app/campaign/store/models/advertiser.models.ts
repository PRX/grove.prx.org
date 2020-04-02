import { HalDoc } from 'ngx-prx-styleguide';

export interface Advertiser {
  id: number;
  name: string;
  set_advertiser_uri: string;
}

export const docToAdvertiser = (doc: HalDoc): Advertiser => {
  const advertiser = doc.asJSON() as Advertiser;
  advertiser.set_advertiser_uri = doc.expand('self');
  return advertiser;
};
