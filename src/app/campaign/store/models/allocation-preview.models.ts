import { HalDoc } from 'ngx-prx-styleguide';
import * as moment from 'moment';

export interface AllocationPreview {
  date: Date;
  goalCount: number;
  inventoryDayId: number;
  zone: string;
}

export const docToAllocationPreviewParams = (doc: HalDoc) => ({
  ...(doc['id'] && { flightId: doc['id'] }),
  dailyMinimum: doc['dailyMinimum'],
  startAt: moment.utc(doc['startAt']).toDate(),
  endAt: moment.utc(doc['endAt']).toDate(),
  name: doc['name'],
  totalGoal: doc['totalGoal'],
  zones: doc['zones'] || []
});

export const docToAllocationPreview = (allocation: any): AllocationPreview => {
  const date = moment.utc(allocation.date).toDate();
  return {
    date,
    goalCount: allocation.goalCount,
    inventoryDayId: allocation.inventoryDayId,
    zone: allocation.zoneName
  };
};
