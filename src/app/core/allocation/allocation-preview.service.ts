import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap, catchError, mergeMap } from 'rxjs/operators';
import { HalObservable, HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { AllocationPreview } from '../campaign/campaign.models';

@Injectable()
export class AllocationPreviewService {
  error: any;

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
            zones
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
        zones
      });
    }
    return preview.pipe(
      // clear error on new request
      tap(() => (this.error = null)),
      catchError(err => this.handleError(err))
    );
  }

  docToAllocationPreview(doc: HalDoc): AllocationPreview {
    return {
      dailyMinimum: doc['dailyMinimum'],
      startAt: doc['startAt'],
      endAt: doc['endAt'],
      name: doc['name'],
      totalGoal: doc['totalGoal'],
      zones: doc['zones'],
      allocations: doc['allocations'].map(allocation => ({
        date: allocation.date,
        goalCount: allocation.goalCount,
        inventoryDayId: allocation.inventoryDayId,
        zoneName: allocation.zoneName
      }))
    };
  }

  handleError(err: any) {
    // augury throws these errors when overallocating or deadlocked
    // augury puts reason in error message but
    // HalRemote sticks a different message in the HalHttpError
    this.error = err;
    // if (err.status === 422 || err.status === 500) {
    //   return of(null);
    // } else {
    throw err;
    // }
  }
}
