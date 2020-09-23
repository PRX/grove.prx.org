import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { selectCampaignFlightInventoryReportData } from '../store/selectors';
import { FlightState, Flight } from '../store/models';
import moment from 'moment';

@Component({
  selector: 'grove-campaign-report',
  template: `
    <a (click)="selectAndDownloadReportData($event.target)" mat-menu-item>Download CSV</a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignReportComponent {
  @Input() campaignName: string;
  @Input() flights: FlightState[];

  constructor(private store: Store<any>) {}

  selectAndDownloadReportData(linkElement: HTMLAnchorElement) {
    this.store.pipe(select(selectCampaignFlightInventoryReportData), first()).subscribe(data => {
      linkElement.href =
        data &&
        'data:text/csv;charset=utf-8,' +
          data
            .map(
              row =>
                row &&
                row
                  .map(v => {
                    return v && typeof v === 'string' && v.indexOf(',') > -1 ? `"${v}"` : v;
                  })
                  .join(',')
            )
            .join('\r\n');
      linkElement.download = `${this.reportFilename}.csv`;
    });
  }

  getFlightDates(flights: Flight[]): { startAt: Date; endAt: Date } {
    return (
      flights &&
      flights.reduce(
        (acc, flight) => {
          let startAt = acc.startAt;
          let endAt = acc.endAt;
          const flightStartAt = flight.contractStartAt ? flight.contractStartAt : flight.startAt;
          if (flightStartAt && (!acc.startAt || acc.startAt.valueOf() > flightStartAt.valueOf())) {
            startAt = new Date(flightStartAt.valueOf());
          }
          const flightEndAt = flight.contractEndAtFudged ? flight.contractEndAtFudged : flight.endAtFudged;
          if (flightEndAt && (!acc.endAt || acc.endAt.valueOf() < flightEndAt.valueOf())) {
            endAt = new Date(flightEndAt.valueOf());
          }
          return { startAt, endAt };
        },
        { startAt: null, endAt: null }
      )
    );
  }

  get reportFilename(): string {
    let fileName = `PRX_${this.campaignName}`;
    if (this.flights) {
      const flightDates = this.getFlightDates(this.flights.filter(flight => flight.remoteFlight).map(flight => flight.remoteFlight));
      if (flightDates.startAt || flightDates.endAt) {
        fileName += '_';
      }
      if (flightDates.startAt) {
        fileName += moment.utc(flightDates.startAt).format('YYYYMMDD');
      }
      if (flightDates.startAt && flightDates.endAt) {
        fileName += '-';
      }
      if (flightDates.endAt) {
        fileName += moment.utc(flightDates.endAt).format('YYYYMMDD');
      }
    }
    return fileName;
  }
}
