import { Pipe, PipeTransform } from '@angular/core';
import { Flight } from '../dashboard.service';
import { ZoneLabelPipe } from '../../shared/pipes/zone-label.pipe';

@Pipe({
  name: 'campaignFlightZones'
})
export class CampaignFlightZonesPipe implements PipeTransform {
  transform(flights: Flight[]): string {
    const labels = [];
    const labeler = new ZoneLabelPipe();

    for (const flight of flights || []) {
      for (const zone of flight.zones || []) {
        const label = labeler.transform(zone);
        if (label && labels.indexOf(label) === -1) {
          labels.push(label);
        }
      }
    }

    return labels.join(', ');
  }
}
