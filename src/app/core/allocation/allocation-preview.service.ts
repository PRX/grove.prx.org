import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HalObservable, HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

@Injectable()
export class AllocationPreviewService {
  constructor(private augury: AuguryService) {}

  getAllocationPreview({ id, set_inventory_uri, name, startAt, endAt, totalGoal, dailyMinimum, zones }): Observable<HalDoc> {
    let preview: HalObservable<HalDoc>;
    if (id) {
      preview = this.augury.follow('prx:flight', { id }).pipe(
        mergeMap(flightDoc =>
          flightDoc.follow('preview', {
            set_inventory_uri,
            name,
            startAt,
            endAt,
            totalGoal,
            dailyMinimum,
            zones: this.getZoneIds(zones)
          })
        )
      ) as HalObservable<HalDoc>;
    } else {
      preview = this.augury.follow('prx:flight-allocation-preview', {
        set_inventory_uri,
        name,
        startAt,
        endAt,
        totalGoal,
        dailyMinimum,
        zones: this.getZoneIds(zones)
      });
    }
    return preview;
  }

  private getZoneIds(zones: any[]): string[] {
    return zones.map(z => (z ? z.id || z : z)).filter(z => z);
  }
}
