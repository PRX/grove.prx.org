import { utc } from 'moment';
import { HalDoc } from 'ngx-prx-styleguide';

export interface InventoryNumbers {
  available: number;
  allocated: number;
  actuals: number;
  inventory?: number;
}
export interface FlightDay {
  date: Date;
  borked: boolean;
  numbers: InventoryNumbers;
}

export interface FlightDays {
  flightDoc?: HalDoc;
  flightId: number;
  days: FlightDay[];
}
export interface InventoryWeeklyRollup {
  startDate: Date;
  endDate: Date;
  numbers: InventoryNumbers;
  days: FlightDay[];
}

export interface InventoryRollup {
  weeks: InventoryWeeklyRollup[];
  totals: InventoryNumbers;
}

export const getFlightDaysId = (state: FlightDays) => {
  return state.flightId;
};

export const docToFlightDays = (flightDoc: HalDoc, flightId: number, flightDaysDocs: any[]): FlightDays => {
  return {
    flightDoc,
    flightId,
    days: flightDaysDocs.map(doc => ({
      numbers: doc as InventoryNumbers,
      borked: doc['available'] !== null && doc['available'] < 0,
      date: utc(doc['date']).toDate()
    }))
  };
};
