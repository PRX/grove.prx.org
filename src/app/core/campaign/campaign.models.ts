export interface CampaignState {
  localCampaign: Campaign;
  remoteCampaign?: Campaign;
  flights: { [id: string]: FlightState };
  availability?: { [flightZone: string]: Availability };
  allocationPreview?: { [flightId: string]: { [zone: string]: AllocationPreview } };
  dailyMinimum?: { [flightId: string]: number };
  changed: boolean;
  valid: boolean;
}

export interface FlightState {
  localFlight: Flight;
  remoteFlight?: Flight;
  changed: boolean;
  valid: boolean;
  softDeleted?: boolean;
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

export interface AvailabilityAllocation {
  allocated?: number;
  availability?: number;
  allocationPreview?: number;
  startDate: string;
  endDate: string;
  groups?: AvailabilityAllocation[];
}

export interface Availability {
  zone: string;
  totals: AvailabilityAllocation;
}

export interface Allocation {
  date: string;
  goalCount: number;
  inventoryDayId: number;
  zoneName: string;
}

export interface AllocationPreview {
  dailyMinimum: number;
  startAt: string;
  endAt: string;
  name: string;
  totalGoal: number;
  zones: string[];
  allocations: Allocation[] | { [date: string]: Allocation };
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
