export interface CampaignState {
  localCampaign: Campaign;
  remoteCampaign?: Campaign;
  flights: { [id: string]: FlightState };
  availability?: { [flightZone: string]: Availability };
  changed: boolean;
  valid: boolean;
}

export interface FlightState {
  localFlight: Flight;
  remoteFlight?: Flight;
  changed: boolean;
  valid: boolean;
}

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

export interface Allocation {
  allocated?: number;
  availability?: number;
  startDate: string;
  endDate: string;
  groups?: Allocation[];
}

export interface Availability {
  zone: string;
  totals: Allocation;
}

export interface Flight {
  id?: number;
  name: string;
  startAt: string;
  endAt: string;
  totalGoal: number;
  zones: string[];
  set_inventory_uri: string;
}

export interface CampaignStateChanges {
  id: number;
  prevId?: number;
  flights: { [prevId: number]: number };
}
