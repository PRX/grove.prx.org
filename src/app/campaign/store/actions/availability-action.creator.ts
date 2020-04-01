import { Action } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { HalDoc } from 'ngx-prx-styleguide';
import { AvailabilityParams } from '../models/availability.models';

export class AvailabilityLoad implements Action {
  readonly type = ActionTypes.CAMPAIGN_AVAILABILITY_LOAD;

  constructor(
    public payload: {
      inventoryId: string;
      startDate: Date;
      endDate: Date;
      zone: string;
      flightId: number;
      createdAt: Date;
    }
  ) {}
}
export class AvailabilityLoadSuccess implements Action {
  readonly type = ActionTypes.CAMPAIGN_AVAILABILITY_LOAD_SUCCESS;

  constructor(public payload: { doc: HalDoc; params: AvailabilityParams }) {}
}
export class AvailabilityLoadFailure implements Action {
  readonly type = ActionTypes.CAMPAIGN_AVAILABILITY_LOAD_FAILURE;

  constructor(public payload: { error: any }) {}
}

export type AvailabilityActions = AvailabilityLoad | AvailabilityLoadSuccess | AvailabilityLoadFailure;
