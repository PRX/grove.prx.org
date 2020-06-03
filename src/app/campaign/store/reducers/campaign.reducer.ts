import { ActionTypes } from '../actions/action.types';
import { AdvertiserActions } from '../actions/advertiser-action.creator';
import { CampaignActions } from '../actions/campaign-action.creator';
import { docToAdvertiser } from '../models/advertiser.models';
import { CampaignState, docToCampaign, duplicateCampaign } from '../models/campaign.models';

export const initialState: CampaignState = {
  localCampaign: {
    name: null,
    type: null,
    status: null,
    repName: null,
    notes: null,
    set_account_uri: null,
    set_advertiser_uri: null
  },
  changed: false,
  valid: false,
  loading: false,
  loaded: false,
  saving: false
};

export function reducer(state = initialState, action: CampaignActions | AdvertiserActions): CampaignState {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_NEW: {
      return { ...initialState, loading: false, loaded: true };
    }
    case ActionTypes.CAMPAIGN_DUP_FROM_FORM: {
      return {
        localCampaign: duplicateCampaign(action.campaign),
        changed: true,
        valid: true,
        loading: false,
        loaded: true,
        saving: false
      };
    }
    case ActionTypes.CAMPAIGN_DUP_BY_ID_SUCCESS: {
      return {
        localCampaign: duplicateCampaign(docToCampaign(action.campaignDoc)),
        changed: true,
        valid: true,
        loading: false,
        loaded: true,
        saving: false
      };
    }
    case ActionTypes.CAMPAIGN_FORM_UPDATE: {
      const { campaign, changed, valid } = action;
      return {
        ...state,
        localCampaign: {
          ...state.localCampaign,
          ...campaign
        },
        changed,
        valid
      };
    }
    case ActionTypes.CAMPAIGN_ADD_ADVERTISER_SUCCESS: {
      const { set_advertiser_uri } = docToAdvertiser(action.doc);
      return {
        ...state,
        localCampaign: {
          ...state.localCampaign,
          set_advertiser_uri
        },
        changed: true
      };
    }
    case ActionTypes.CAMPAIGN_ADVERTISERS_LOAD:
    case ActionTypes.CAMPAIGN_LOAD: {
      return {
        ...state,
        loading: true,
        loaded: false
      };
    }
    case ActionTypes.CAMPAIGN_SAVE: {
      return {
        ...state,
        saving: true
      };
    }
    case ActionTypes.CAMPAIGN_LOAD_SUCCESS:
    case ActionTypes.CAMPAIGN_SAVE_SUCCESS: {
      if (action.campaignDoc) {
        const campaign = docToCampaign(action.campaignDoc);
        return {
          ...state,
          doc: action.campaignDoc,
          localCampaign: campaign,
          remoteCampaign: campaign,
          changed: false,
          valid: true,
          saving: false,
          loading: false,
          loaded: true,
          error: null
        };
      }
      return state;
    }
    case ActionTypes.CAMPAIGN_DUP_BY_ID_FAILURE:
    case ActionTypes.CAMPAIGN_LOAD_FAILURE: {
      return {
        ...initialState,
        loading: false,
        loaded: true,
        error: action.error
      };
    }
    case ActionTypes.CAMPAIGN_SAVE_FAILURE: {
      return {
        ...state,
        saving: false,
        error: action.error
      };
    }
    case ActionTypes.CAMPAIGN_DELETE_SUCCESS: {
      return {
        ...initialState
      };
    }
    case ActionTypes.CAMPAIGN_DELETE_FAILURE: {
      return {
        ...state,
        error: action.error
      };
    }
    default:
      return state;
  }
}
