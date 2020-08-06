import { createAction, props, union } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { HalDoc } from 'ngx-prx-styleguide';
import { Flight } from '../models';

export const FlightPreviewCreate = createAction(
  ActionTypes.CAMPAIGN_FLIGHT_PREVIEW_CREATE,
  props<{
    flight: Flight;
    flightDoc?: HalDoc;
    campaignDoc?: HalDoc;
  }>()
);
export const FlightPreviewCreateSuccess = createAction(
  ActionTypes.CAMPAIGN_FLIGHT_PREVIEW_CREATE_SUCCESS,
  props<{
    flight: Flight;
    allocationStatus: string;
    allocationStatusMessage: string;
    flightDaysDocs: HalDoc[];
    flightDoc?: HalDoc;
    campaignDoc?: HalDoc;
  }>()
);
export const FlightPreviewCreateFailure = createAction(
  ActionTypes.CAMPAIGN_FLIGHT_PREVIEW_CREATE_FAILURE,
  props<{ flight: Flight; error: any }>()
);

const all = union({ FlightPreviewCreate, FlightPreviewCreateSuccess, FlightPreviewCreateFailure });
export type FlightPreviewActions = typeof all;
