import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
}
