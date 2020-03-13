export interface CampaignState {
  availability?: { [flightZone: string]: Availability };
  allocationPreview?: { [flightId: string]: { [zone: string]: AllocationPreview } };
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
