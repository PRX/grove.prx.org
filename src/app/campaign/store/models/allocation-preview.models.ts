import { HalDoc } from 'ngx-prx-styleguide';

export interface AllocationPreview {
  date: Date;
  goalCount: number;
  inventoryDayId: number;
  zone: string;
}

export const docToAllocationPreviewParams = (doc: HalDoc) => ({
  ...(doc['id'] && { flightId: doc['id'] }),
  dailyMinimum: doc['dailyMinimum'],
  startAt: new Date(doc['startAt']),
  endAt: new Date(doc['endAt']),
  name: doc['name'],
  totalGoal: doc['totalGoal'],
  zones: doc['zones'] || []
});

export const docToAllocationPreview = (allocation: any): AllocationPreview => {
  const date = new Date(allocation.date);
  return {
    date,
    goalCount: allocation.goalCount,
    inventoryDayId: allocation.inventoryDayId,
    zone: allocation.zoneName
  };
};
