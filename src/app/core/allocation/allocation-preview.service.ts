import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { AllocationPreview } from '../campaign/campaign.models';

@Injectable()
export class AllocationPreviewService {
  constructor(private augury: AuguryService) {}

  getAllocationPreview({ set_inventory_uri, name, startAt, endAt, totalGoal, dailyMinimum, zones }): Observable<AllocationPreview> {
    return this.augury
      .follow('prx:flight-allocation-preview', {
        set_inventory_uri,
        name,
        startAt,
        endAt,
        totalGoal,
        dailyMinimum,
        zones
      })
      .pipe(map(docs => this.docToAllocationPreview(docs)));
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
}
