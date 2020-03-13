import { CampaignActions, ActionTypes } from '../actions/';
import { CampaignState, docToCampaign } from './campaign.models';

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

export function reducer(state = initialState, action: CampaignActions): CampaignState {
  switch (action.type) {
    case ActionTypes.CAMPAIGN_LOAD_OPTIONS: {
      return { ...state, loading: true, loaded: false };
    }
    case ActionTypes.CAMPAIGN_NEW: {
      return { ...initialState, loading: false, loaded: true };
    }
    case ActionTypes.CAMPAIGN_FORM_UPDATE: {
      const { campaign, changed, valid } = action.payload;
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
    case ActionTypes.CAMPAIGN_SET_ADVERTISER: {
      const { set_advertiser_uri } = action.payload;
      return {
        ...state,
        localCampaign: {
          ...state.localCampaign,
          set_advertiser_uri
        },
        changed: true
      };
    }
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
      if (action.payload.campaignDoc) {
        const campaign = docToCampaign(action.payload.campaignDoc);
        return {
          ...state,
          doc: action.payload.campaignDoc,
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
    case ActionTypes.CAMPAIGN_LOAD_FAILURE: {
      return {
        ...state,
        loading: false,
        loaded: true,
        error: action.payload.error
      };
    }
    case ActionTypes.CAMPAIGN_SAVE_FAILURE: {
      return {
        ...state,
        saving: false,
        error: action.payload.error
      };
    }
    default:
      return state;
  }
}
