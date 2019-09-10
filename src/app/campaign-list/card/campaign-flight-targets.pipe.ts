import { Pipe, PipeTransform } from '@angular/core';
import { Flight } from '../campaign-list.service';

@Pipe({
  name: 'campaignFlightTargets'
})
export class CampaignFlightTargetsPipe implements PipeTransform {
  transform(flights: Flight[]): string {
    if (flights && flights.some(flight => flight.targets && flight.targets.length > 0)) {
      return flights.reduce((acc, flight) => {
        return acc += flight.targets && (acc && ', ') +
          flight.targets.map(t => t.label).join(', ');
      }, '');
    } else {
      return '';
    }
  }
}
