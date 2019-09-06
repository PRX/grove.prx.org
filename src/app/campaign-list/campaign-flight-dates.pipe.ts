import { Pipe, PipeTransform } from '@angular/core';
import { Flight } from './campaign-list.service';

@Pipe({
  name: 'campaignFlightDates'
})
export class CampaignFlightDatesPipe implements PipeTransform {
  transform(flights: Flight[]): string {
    const dates = flights && flights.reduce((acc, flight) => {
      let startAt = acc.startAt;
      let endAt = acc.endAt;
      if (!acc.startAt || (flight.startAt && acc.startAt.valueOf() > flight.startAt.valueOf())) {
        startAt = new Date(flight.startAt);
      }
      if (!acc.endAt || (flight.endAt && acc.endAt.valueOf() < flight.endAt.valueOf())) {
        endAt = new Date(flight.endAt);
      }
      return {startAt, endAt};
    }, {startAt: null, endAt: null});
    if (dates && dates.startAt && dates.endAt) {
      return `${dates.startAt.getMonth() + 1}/${dates.startAt.getDate()} - ${dates.endAt.getMonth() + 1}/${dates.endAt.getDate()}`;
    }
  }
}
