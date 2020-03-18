import { Campaign } from './campaign.models';
import { Flight } from './flight.models';

export interface CampaignFormSave {
  campaign: Campaign;
  updatedFlights: Flight[];
  createdFlights: Flight[];
  deletedFlights: Flight[];
}
