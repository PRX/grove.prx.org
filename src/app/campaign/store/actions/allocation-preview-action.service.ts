import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as actions from './allocation-preview-action.creator';

@Injectable()
export class AllocationPreviewActionService {
  constructor(private store: Store<any>) {}

  loadAllocationPreview(
    flightId: number,
    // tslint:disable-next-line: variable-name
    set_inventory_uri: string,
    name: string,
    startAt: Date,
    endAt: Date,
    totalGoal: number,
    dailyMinimum: number,
    zones: string[]
  ) {
    this.store.dispatch(
      new actions.AllocationPreviewLoad({ flightId, set_inventory_uri, name, startAt, endAt, totalGoal, dailyMinimum, zones })
    );
  }
}
