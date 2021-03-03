import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../augury.service';

@Injectable()
export class InventoryService {
  constructor(private augury: AuguryService) {}

  loadInventory(): Observable<HalDoc[]> {
    return this.augury.followItems('prx:inventories', { per: 999 });
  }

  loadInventoryTargets(inventory: number | HalDoc): Observable<HalDoc> {
    if (inventory instanceof HalDoc && inventory.follow) {
      return inventory.follow('prx:targets');
    } else {
      return this.augury.follow('prx:inventory', { id: inventory }).follow('prx:targets');
    }
  }
}
