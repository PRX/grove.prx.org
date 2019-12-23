import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { DashboardService, Flight } from '../dashboard.service';

export class FlightsDataSource implements DataSource<Flight> {
  constructor(private dashboardService: DashboardService) {}

  connect(collectionViewer: CollectionViewer): Observable<Flight[]> {
    return this.dashboardService.flights;
  }

  disconnect(collectionViewer: CollectionViewer): void {}
}
