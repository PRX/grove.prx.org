import { Pipe, PipeTransform } from '@angular/core';
import { Flight } from '../dashboard.service';

@Pipe({
  name: 'campaignFlightDates'
})
export class CampaignFlightDatesPipe implements PipeTransform {
  flightDates(flights: Flight[]): { startAt: Date; endAt: Date } {
    return (
      flights &&
      flights.reduce(
        (acc, flight) => {
          let startAt = acc.startAt;
          let endAt = acc.endAt;
          if (!acc.startAt || (flight.startAt && acc.startAt.valueOf() > flight.startAt.valueOf())) {
            startAt = flight.startAt;
          }
          if (!acc.endAt || (flight.endAt && acc.endAt.valueOf() < flight.endAt.valueOf())) {
            endAt = flight.endAt;
          }
          return { startAt, endAt };
        },
        { startAt: null, endAt: null }
      )
    );
  }

  transform(flights: Flight[]): string {
    const dates = this.flightDates(flights);
    if (dates && dates.startAt && dates.endAt) {
      return `${dates.startAt.getMonth() + 1}/${dates.startAt.getDate()} - ${dates.endAt.getMonth() + 1}/${dates.endAt.getDate()}`;
    }
  }
}
