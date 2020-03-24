import { Action } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { HalDoc } from 'ngx-prx-styleguide';

export class AllocationPreviewLoad implements Action {
  readonly type = ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD;

  constructor(
    public payload: {
      flightId: number;
      set_inventory_uri: string;
      name: string;
      startAt: Date;
      endAt: Date;
      totalGoal: number;
      dailyMinimum: number;
      zones: string[];
    }
  ) {}
}
export class AllocationPreviewLoadSuccess implements Action {
  readonly type = ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD_SUCCESS;

  constructor(public payload: { allocationPreviewDoc: HalDoc }) {}
}
export class AllocationPreviewLoadFailure implements Action {
  readonly type = ActionTypes.CAMPAIGN_ALLOCATION_PREVIEW_LOAD_FAILURE;

  constructor(public payload: { error: any }) {}
}

export type AllocationPreviewActions = AllocationPreviewLoad | AllocationPreviewLoadSuccess | AllocationPreviewLoadFailure;
