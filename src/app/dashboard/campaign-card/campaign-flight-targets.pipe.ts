import { Pipe, PipeTransform } from '@angular/core';
import { Flight } from '../dashboard.service';

@Pipe({
  name: 'campaignFlightTargets'
})
export class CampaignFlightTargetsPipe implements PipeTransform {
  transform(flights: Flight[]): string {
    if (flights && flights.some(flight => flight.targets && flight.targets.length > 0)) {
      const targets = flights.reduce((fAcc, flight) => {
        return { ...fAcc, ...flight.targets.reduce((tAcc, target) => ({ ...tAcc, [target.label]: target.label }), {}) };
      }, {});
      return Object.keys(targets).join(', ');
    } else {
      return '';
    }
  }
}
