import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';
import { Moment, utc } from 'moment';

export interface FlightDay {
  date: Moment;
  available: number;
  allocated: number;
  actuals: number;
  inventory: number;
}

export interface FlightDays {
  flightDoc?: HalDoc;
  flightId: number;
  days: FlightDay[];
}

export const getFlightDaysId = (state: FlightDays) => {
  return state.flightId;
};

export const docToFlightDays = (flightDoc: HalDoc, flightDaysDocs: HalDoc[]): FlightDays => {
  return {
    flightDoc,
    flightId: flightDoc.id,
    days: flightDaysDocs.map(doc => ({ ...(filterUnderscores(doc) as FlightDay), date: utc(doc['date']) }))
  };
};
