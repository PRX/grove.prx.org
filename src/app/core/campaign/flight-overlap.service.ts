import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

@Injectable()
export class FlightOverlapService {
  constructor(private augury: AuguryService) {}

  loadFlightOverlap(filters: string): Observable<HalDoc[]> {
    const sorts = 'allocationPriority:asc,name:asc';
    return this.augury.followItems('prx:flights', { per: 999, zoom: 0, filters, sorts });
  }
}
