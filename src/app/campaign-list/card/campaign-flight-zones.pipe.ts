import { Pipe, PipeTransform } from '@angular/core';
import { Flight } from '../campaign-list.service';

@Pipe({
  name: 'campaignFlightZones'
})
export class CampaignFlightZonesPipe implements PipeTransform {
  transform(flights: Flight[]): string {
    if (flights && flights.some(flight => flight.zones && flight.zones.length > 0)) {
      const zones = flights.reduce((fAcc, flight) => {
        return {...fAcc, ...flight.zones.reduce((zAcc, zone) => ({...zAcc, [zone]: zone}), {})};
      }, {});
      return Object.keys(zones).join(', ');
    } else {
      return '';
    }
  }
}
