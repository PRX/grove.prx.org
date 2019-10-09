import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';
import { Availability } from '../campaign/campaign.models';

export interface Inventory {
  id: number;
  podcastTitle: string;
  zones: InventoryZone[];
  self_uri: string;
}

export interface InventoryZone {
  id: string;
  label: string;
}

@Injectable()
export class InventoryService {
  constructor(private augury: AuguryService) {}

  listInventory(params = {}): Observable<Inventory[]> {
    return this.augury.followItems('prx:inventory', params).pipe(map(docs => this.docsToInventory(docs)));
  }

  docsToInventory(docs: HalDoc[]): Inventory[] {
    return docs.map(this.docToInventory);
  }

  docToInventory(doc: HalDoc): Inventory {
    return {
      id: doc.id,
      podcastTitle: doc['podcastTitle'],
      zones: doc['zones'],
      self_uri: doc.expand('self')
    };
  }

  getInventoryAvailability({id, startDate, endDate, zoneName, flightId}): Observable<Availability> {
    return this.augury.follow('prx:inventory', {id}).pipe(
      switchMap(inventory => {
        return inventory.follow('prx:availability', {
          startDate,
          endDate,
          zoneName,
          flightId
        });
      }),
      map(doc => this.docToAvailability(zoneName, doc))
    );
  }

  docToAvailability(zone: string, doc: HalDoc): Availability {
    return {
      totals: {
        startDate: doc['startDate'],
        endDate: doc['endDate'],
        groups: doc['availabilityAllocationDays'].map(allocation => ({
          allocated: allocation.allocated,
          availability: allocation.availability,
          startDate: allocation.date,
          endDate: allocation.date
        }))
      }, zone
    };
  }
}
