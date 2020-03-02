import { HalDoc } from 'ngx-prx-styleguide';

const filter = (doc: HalDoc): {} => {
  return Object.keys(doc.asJSON())
    .filter(key => !key.startsWith('_'))
    .reduce((obj, key) => ({ ...obj, [key]: doc[key] }), {});
};

export interface Campaign {
  id?: number;
  name: string;
  type: string;
  status: string;
  repName: string;
  notes: string;
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
  saving: boolean;
  error?: any;
}

export const docToCampaign = (doc: HalDoc): Campaign => {
  const campaign = filter(doc) as Campaign;
  campaign.set_advertiser_uri = doc.expand('prx:advertiser');
  campaign.set_account_uri = doc.expand('prx:account');
  return campaign;
};

export interface Flight {
  name: string;
  startAt: Date;
  endAt: Date;
  totalGoal: number;
  zones: string[];
  set_inventory_uri: string;
  status?: string;
  status_message?: string;
}

export interface FlightState {
  id: number;
  doc?: HalDoc;
  localFlight: Flight;
  remoteFlight?: Flight;
  changed: boolean;
  valid: boolean;
  softDeleted?: boolean;
}

export const docToFlight = (doc: HalDoc): Flight => {
  const flight = filter(doc) as Flight;
  flight.startAt = new Date(flight.startAt.valueOf());
  flight.endAt = new Date(flight.endAt.valueOf());
  flight.set_inventory_uri = doc.expand('prx:inventory');
  return flight;
};
