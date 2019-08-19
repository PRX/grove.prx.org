import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { AuguryService } from '../../core/augury.service';
import { InventoryModel } from 'src/app/shared/model/inventory.model';

@Injectable()
export class InventoryService {
  // tslint:disable-next-line: variable-name
  private _inventory: BehaviorSubject<InventoryModel[]> = new BehaviorSubject([]);
  error: Error;

  constructor(private augury: AuguryService) {
    this.loadInventory();
  }

  get inventory(): Observable<InventoryModel[]> {
    return this._inventory.asObservable();
  }

  loadInventory() {
    this.augury.followItems('prx:inventories').pipe(withLatestFrom(this.augury.root)).subscribe(([inventory, root]) => {
      this._inventory.next(inventory.map(s => new InventoryModel(root, s, false)));
    },
    err => this.error = err);
  }
}
