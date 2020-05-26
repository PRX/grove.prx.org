import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

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

// filter zone options to the control at an index
export const filterZones = (allZones: InventoryZone[], selectedFlightZones: InventoryZone[], zoneIndex?: number) => {
  selectedFlightZones = selectedFlightZones || [];

  // if allZones is empty/undefined (hasn't loaded yet,) use the flight.zones as options
  const options = allZones || selectedFlightZones;
  return options.filter(zone => {
    if (selectedFlightZones[zoneIndex] && selectedFlightZones[zoneIndex].id === zone.id) {
      // include currently selected zone
      return true;
    } else {
      // remove zones selected by other controls
      return !selectedFlightZones.find(z => z.id === zone.id);
    }
  });
};

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

  getInventoryAvailability({
    id,
    startDate,
    endDate,
    zone,
    flightId
  }: {
    id: string;
    startDate: string;
    endDate: string;
    zone: string;
    flightId: number;
  }): Observable<HalDoc> {
    return this.augury.follow('prx:inventory', { id }).pipe(
      switchMap(inventory => {
        return inventory.follow('prx:availability', {
          startDate,
          endDate,
          zone,
          flightId
        });
      })
    );
  }
}
