import { createAction, props, union } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { Flight } from '../models';
import { HalDoc } from 'ngx-prx-styleguide';

export const FlightOverlapLoad = createAction(
  ActionTypes.CAMPAIGN_FLIGHT_OVERLAP_LOAD,
  props<{
    flight: Flight;
  }>()
);
export const FlightOverlapLoadSuccess = createAction(
  ActionTypes.CAMPAIGN_FLIGHT_OVERLAP_LOAD_SUCCESS,
  props<{
    flight: Flight;
    overlap: HalDoc[];
  }>()
);
export const FlightOverlapLoadFailure = createAction(
  ActionTypes.CAMPAIGN_FLIGHT_OVERLAP_LOAD_FAILURE,
  props<{ flight: Flight; error: any }>()
);

const all = union({ FlightOverlapLoad, FlightOverlapLoadSuccess, FlightOverlapLoadFailure });
export type FlightOverlapActions = typeof all;
