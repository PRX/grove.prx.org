import { Pipe, PipeTransform } from '@angular/core';
import { Flight } from './campaign-list.service';

@Pipe({
  name: 'campaignFlightZones'
})
export class CampaignFlightZonesPipe implements PipeTransform {
  transform(flights: Flight[]): string {
    if (flights && flights.some(flight => flight.zones && flight.zones.length > 0)) {
      return flights.reduce((acc, flight) => {
        return acc += flight.zones && (acc && ' ') + flight.zones.join(' ');
      }, '');
    } else {
      return '';
    }
  }
}
