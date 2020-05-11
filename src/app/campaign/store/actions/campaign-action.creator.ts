import { Action } from '@ngrx/store';
import { ActionTypes } from './action.types';
import { Campaign, Flight, CampaignFormSave } from '../models';
import { HalDoc } from 'ngx-prx-styleguide';
import { utc, Moment } from 'moment';

export class CampaignNew implements Action {
  readonly type = ActionTypes.CAMPAIGN_NEW;

  constructor(public payload: {}) {}
}

export class CampaignDuplicate implements Action {
  readonly type = ActionTypes.CAMPAIGN_DUPLICATE;

  constructor(
    public payload: {
      campaign: Campaign;
      flights: Flight[];
    }
  ) {}
}

export class CampaignDupFromForm implements Action {
  readonly type = ActionTypes.CAMPAIGN_DUP_FROM_FORM;

  constructor(public payload: { campaign: Campaign; flights: Flight[]; timestamp?: number }) {
    this.payload.timestamp = payload.timestamp || Date.now();
  }
}

export class CampaignDupById implements Action {
  readonly type = ActionTypes.CAMPAIGN_DUP_BY_ID;

  constructor(public payload: { id: number; timestamp?: number }) {
    this.payload.timestamp = payload.timestamp || Date.now();
  }
}

export class CampaignDupByIdSuccess implements Action {
  readonly type = ActionTypes.CAMPAIGN_DUP_BY_ID_SUCCESS;

  constructor(public payload: { campaignDoc: HalDoc; flightDocs: HalDoc[]; timestamp?: number }) {
    this.payload.timestamp = payload.timestamp || Date.now();
  }
}

export class CampaignDupByIdFailure implements Action {
  readonly type = ActionTypes.CAMPAIGN_DUP_BY_ID_FAILURE;

  constructor(public payload: { error: any }) {}
}

export class CampaignLoad implements Action {
  readonly type = ActionTypes.CAMPAIGN_LOAD;

  constructor(public payload: { id: number }) {}
}
export class CampaignLoadSuccess implements Action {
  readonly type = ActionTypes.CAMPAIGN_LOAD_SUCCESS;

  constructor(public payload: { campaignDoc: HalDoc; flightDocs: HalDoc[] }) {}
}
export class CampaignLoadFailure implements Action {
  readonly type = ActionTypes.CAMPAIGN_LOAD_FAILURE;

  constructor(public payload: { error: any }) {}
}

export class CampaignFormUpdate implements Action {
  readonly type = ActionTypes.CAMPAIGN_FORM_UPDATE;

  constructor(public payload: { campaign: Campaign; changed: boolean; valid: boolean }) {}
}

export class CampaignSave implements Action {
  readonly type = ActionTypes.CAMPAIGN_SAVE;

  constructor(public payload: CampaignFormSave) {}
}
export class CampaignSaveSuccess implements Action {
  readonly type = ActionTypes.CAMPAIGN_SAVE_SUCCESS;

  constructor(
    public payload: {
      campaignDoc: HalDoc;
      deletedFlightDocs: { [id: number]: HalDoc };
      updatedFlightDocs: { [id: number]: HalDoc };
      createdFlightDocs: { [id: number]: HalDoc };
    }
  ) {}
}
export class CampaignSaveFailure implements Action {
  readonly type = ActionTypes.CAMPAIGN_SAVE_FAILURE;

  constructor(public payload: { error: any }) {}
}

export class CampaignDelete implements Action {
  readonly type = ActionTypes.CAMPAIGN_DELETE;

  constructor(public payload: HalDoc) {}
}
export class CampaignDeleteSuccess implements Action {
  readonly type = ActionTypes.CAMPAIGN_DELETE_SUCCESS;

  constructor(public payload: { id: number | string }) {}
}
export class CampaignDeleteFailure implements Action {
  readonly type = ActionTypes.CAMPAIGN_DELETE_FAILURE;

  constructor(public payload: { error: any }) {}
}

export class CampaignAddFlight implements Action {
  readonly type = ActionTypes.CAMPAIGN_ADD_FLIGHT;

  public payload: { campaignId: number | string; flightId: number; startAt: Moment; endAt: Moment };

  constructor(payload: { campaignId: number | string; flightId?: number; startAt?: Moment; endAt?: Moment }) {
    const date = utc();
    this.payload = {
      campaignId: payload.campaignId,
      flightId: payload.flightId || date.valueOf(),
      startAt:
        payload.startAt ||
        utc(date.valueOf())
          .hours(0)
          .minutes(0)
          .seconds(0)
          .milliseconds(0),
      endAt:
        payload.endAt ||
        utc(date.valueOf())
          .month(date.month() + 1)
          .date(1)
          .hours(0)
          .minutes(0)
          .seconds(0)
          .milliseconds(0)
    };
  }
}

export class CampaignDupFlight implements Action {
  readonly type = ActionTypes.CAMPAIGN_DUP_FLIGHT;

  constructor(public payload: { campaignId: number | string; flight: Flight; flightId?: number }) {
    this.payload.flightId = payload.flightId || Date.now();
  }
}

export class CampaignDeleteFlight implements Action {
  readonly type = ActionTypes.CAMPAIGN_DELETE_FLIGHT;

  constructor(public payload: { id: number; softDeleted: boolean }) {}
}

export class CampaignFlightFormUpdate implements Action {
  readonly type = ActionTypes.CAMPAIGN_FLIGHT_FORM_UPDATE;

  constructor(public payload: { flight: Flight; changed: boolean; valid: boolean }) {}
}

export class CampaignFlightSetGoal implements Action {
  readonly type = ActionTypes.CAMPAIGN_FLIGHT_SET_GOAL;

  constructor(public payload: { flightId: number; totalGoal: number; dailyMinimum: number; valid: boolean }) {}
}

export type CampaignActions =
  | CampaignNew
  | CampaignDupFromForm
  | CampaignDupById
  | CampaignDupByIdSuccess
  | CampaignDupByIdFailure
  | CampaignLoad
  | CampaignLoadSuccess
  | CampaignLoadFailure
  | CampaignFormUpdate
  | CampaignFlightFormUpdate
  | CampaignFlightSetGoal
  | CampaignAddFlight
  | CampaignDupFlight
  | CampaignDeleteFlight
  | CampaignSave
  | CampaignSaveSuccess
  | CampaignSaveFailure
  | CampaignDelete
  | CampaignDeleteSuccess
  | CampaignDeleteFailure;
