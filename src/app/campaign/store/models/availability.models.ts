export interface AvailabilityParams {
  inventoryId: string;
  startDate: Date;
  endDate: Date;
  zone: string;
  flightId: number;
}

export interface InventoryNumbers {
  allocated: number;
  availability: number;
  actuals: number;
  allocationPreview?: number;
}

export interface AvailabilityDay {
  date: Date;
  numbers: InventoryNumbers;
}

export const docToAvailabilityDay = (availability: any): AvailabilityDay => {
  return { date: new Date(availability.date), numbers: { ...availability } };
};

export interface Availability {
  params: AvailabilityParams;
  days: AvailabilityDay[];
}

export interface AvailabilityWeeklyRollup {
  startDate: Date;
  endDate: Date;
  numbers: InventoryNumbers;
  days: AvailabilityDay[];
}

export interface AvailabilityRollup {
  params: AvailabilityParams;
  weeks: AvailabilityWeeklyRollup[];
  totals: InventoryNumbers;
}
