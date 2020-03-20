export interface CampaignState {
  availability?: { [flightZone: string]: Availability };
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
