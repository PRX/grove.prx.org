import { createAction, props, union } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { Campaign, Flight, FlightZone, CampaignFormSave } from '../models';
import { HalDoc } from 'ngx-prx-styleguide';
import { utc, Moment } from 'moment';

export const CampaignNew = createAction(ActionTypes.CAMPAIGN_NEW);

export const CampaignDuplicate = createAction(ActionTypes.CAMPAIGN_DUPLICATE, props<{ campaign: Campaign; flights: Flight[] }>());

export const CampaignDupFromForm = createAction(
  ActionTypes.CAMPAIGN_DUP_FROM_FORM,
  ({ campaign, flights, timestamp }: { campaign: Campaign; flights: Flight[]; timestamp?: number }) => ({
    campaign,
    flights,
    timestamp: timestamp || Date.now()
  })
);

export const CampaignDupById = createAction(ActionTypes.CAMPAIGN_DUP_BY_ID, ({ id, timestamp }: { id: number; timestamp?: number }) => ({
  id,
  timestamp: timestamp || Date.now()
}));
export const CampaignDupByIdSuccess = createAction(
  ActionTypes.CAMPAIGN_DUP_BY_ID_SUCCESS,
  ({ campaignDoc, flightDocs, timestamp }: { campaignDoc: HalDoc; flightDocs: HalDoc[]; timestamp?: number }) => ({
    campaignDoc,
    flightDocs,
    timestamp: timestamp || Date.now()
  })
);
export const CampaignDupByIdFailure = createAction(ActionTypes.CAMPAIGN_DUP_BY_ID_FAILURE, props<{ error }>());

export const CampaignLoad = createAction(ActionTypes.CAMPAIGN_LOAD, props<{ id }>());
export const CampaignLoadSuccess = createAction(
  ActionTypes.CAMPAIGN_LOAD_SUCCESS,
  ({
    campaignDoc,
    flightDocs,
    flightDaysDocs
  }: {
    campaignDoc: HalDoc;
    flightDocs: HalDoc[];
    flightDaysDocs: { [id: number]: HalDoc[] };
  }) => ({ campaignDoc, flightDocs, flightDaysDocs })
);
export const CampaignLoadFailure = createAction(ActionTypes.CAMPAIGN_LOAD_FAILURE, props<{ error }>());

export const CampaignFormUpdate = createAction(
  ActionTypes.CAMPAIGN_FORM_UPDATE,
  ({ campaign, changed, valid }: { campaign: Campaign; changed: boolean; valid: boolean }) => ({ campaign, changed, valid })
);

export const CampaignSave = createAction(ActionTypes.CAMPAIGN_SAVE, (params: CampaignFormSave) => params);
export const CampaignSaveSuccess = createAction(
  ActionTypes.CAMPAIGN_SAVE_SUCCESS,
  props<{
    campaignDoc: HalDoc;
    deletedFlightDocs: { [id: number]: HalDoc };
    updatedFlightDocs: { [id: number]: HalDoc };
    updatedFlightDaysDocs: { [id: number]: HalDoc[] };
    createdFlightDocs: { [id: number]: HalDoc };
    createdFlightDaysDocs: { [id: number]: HalDoc[] };
  }>()
);
export const CampaignSaveFailure = createAction(ActionTypes.CAMPAIGN_SAVE_FAILURE, props<{ error }>());

export const CampaignDelete = createAction(ActionTypes.CAMPAIGN_DELETE, props<{ doc: HalDoc }>());
export const CampaignDeleteSuccess = createAction(ActionTypes.CAMPAIGN_DELETE_SUCCESS, props<{ id: number | string }>());
export const CampaignDeleteFailure = createAction(ActionTypes.CAMPAIGN_DELETE_FAILURE, props<{ error }>());

export const CampaignDismissError = createAction(ActionTypes.CAMPAIGN_DISMISS_ERROR);

export const CampaignAddFlight = createAction(
  ActionTypes.CAMPAIGN_ADD_FLIGHT,
  ({ campaignId, flightId, startAt, endAt }: { campaignId: number | string; flightId?: number; startAt?: Moment; endAt?: Moment }) => {
    const date = utc();
    return {
      campaignId,
      flightId: flightId || date.valueOf(),
      startAt:
        startAt ||
        utc(date.valueOf())
          .hours(0)
          .minutes(0)
          .seconds(0)
          .milliseconds(0),
      endAt:
        endAt ||
        utc(date.valueOf())
          .month(date.month() + 1)
          .date(1)
          .hours(0)
          .minutes(0)
          .seconds(0)
          .milliseconds(0)
    };
  }
);

export const CampaignDupFlight = createAction(
  ActionTypes.CAMPAIGN_DUP_FLIGHT,
  ({ campaignId, flight, flightId }: { campaignId: number | string; flight: Flight; flightId?: number }) => ({
    campaignId,
    flight,
    flightId: flightId || Date.now()
  })
);

export const CampaignDeleteFlight = createAction(ActionTypes.CAMPAIGN_DELETE_FLIGHT, props<{ id: number; softDeleted: boolean }>());

export const CampaignFlightFormUpdate = createAction(
  ActionTypes.CAMPAIGN_FLIGHT_FORM_UPDATE,
  props<{ flight: Flight; changed: boolean; valid: boolean }>()
);

export const CampaignFlightAddZone = createAction(ActionTypes.CAMPAIGN_FLIGHT_ADD_ZONE, props<{ flightId: number; zone: FlightZone }>());
export const CampaignFlightRemoveZone = createAction(ActionTypes.CAMPAIGN_FLIGHT_REMOVE_ZONE, props<{ flightId: number; index: number }>());

const all = union({
  CampaignNew,
  CampaignDupFromForm,
  CampaignDupById,
  CampaignDupByIdSuccess,
  CampaignDupByIdFailure,
  CampaignLoad,
  CampaignLoadSuccess,
  CampaignLoadFailure,
  CampaignFormUpdate,
  CampaignSave,
  CampaignSaveSuccess,
  CampaignSaveFailure,
  CampaignDelete,
  CampaignDeleteSuccess,
  CampaignDeleteFailure,
  CampaignDismissError,
  CampaignFlightFormUpdate,
  CampaignAddFlight,
  CampaignDupFlight,
  CampaignDeleteFlight,
  CampaignFlightAddZone,
  CampaignFlightRemoveZone
});
export type CampaignActions = typeof all;
