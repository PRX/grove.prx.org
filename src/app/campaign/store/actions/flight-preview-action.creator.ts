import { Action } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { HalDoc } from 'ngx-prx-styleguide';
import { FlightPreviewParams } from '../models';

export class FlightPreviewCreate implements Action {
  readonly type = ActionTypes.CAMPAIGN_FLIGHT_PREVIEW_CREATE;

  constructor(
    public payload: {
      params: FlightPreviewParams;
      flightId: number;
      flightDoc?: HalDoc;
      campaignDoc?: HalDoc;
    }
  ) {}
}
export class FlightPreviewCreateSuccess implements Action {
  readonly type = ActionTypes.CAMPAIGN_FLIGHT_PREVIEW_CREATE_SUCCESS;

  constructor(
    public payload: { params: FlightPreviewParams; flightDaysDocs: HalDoc[]; flightId: number; flightDoc?: HalDoc; campaignDoc?: HalDoc }
  ) {}
}
export class FlightPreviewCreateFailure implements Action {
  readonly type = ActionTypes.CAMPAIGN_FLIGHT_PREVIEW_CREATE_FAILURE;

  constructor(public payload: { error: any }) {}
}

export type FlightPreviewActions = FlightPreviewCreate | FlightPreviewCreateSuccess | FlightPreviewCreateFailure;
