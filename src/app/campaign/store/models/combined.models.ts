import { HalDoc } from 'ngx-prx-styleguide';
import { Campaign } from './campaign.models';
import { Flight } from './flight.models';

export interface CampaignFormSave {
  campaign: Campaign;
  campaignDoc: HalDoc;
  updatedFlights: Flight[];
  createdFlights: Flight[];
  deletedFlights: Flight[];
}
