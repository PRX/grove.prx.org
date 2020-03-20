import { HalDoc } from 'ngx-prx-styleguide';

export interface Allocation {
  date: Date;
  goalCount: number;
  inventoryDayId: number;
  zone: string;
}

export const docToAllocationPreview = (doc: HalDoc) => ({
  flightId: doc['id'],
  dailyMinimum: doc['dailyMinimum'],
  startAt: new Date(doc['startAt']),
  endAt: new Date(doc['endAt']),
  name: doc['name'],
  totalGoal: doc['totalGoal'],
  zones: doc['zones']
});

export const docToAllocations = (allocations: any[]): Allocation[] =>
  allocations.map(
    (allocation): Allocation => {
      const date = new Date(allocation.date);
      return {
        date,
        goalCount: allocation.goalCount,
        inventoryDayId: allocation.inventoryDayId,
        zone: allocation.zoneName
      };
    }
  );
