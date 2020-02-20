import { CampaignActions } from '../actions/';
import { CampaignActionTypes } from '../actions/campaign.action.types';
import { HalDoc } from 'ngx-prx-styleguide';

export interface Campaign {
  id?: number;
  name: string;
  type: string;
  status: string;
  repName: string;
  notes: string;
  set_account_uri: string;
  set_advertiser_uri: string;
}

export interface CampaignState {
  doc?: HalDoc;
  localCampaign: Campaign;
  remoteCampaign?: Campaign;
  changed: boolean;
  valid: boolean;
  loading: boolean;
  saving: boolean;
  error?: any;
}

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
  saving: false
};

export function reducer(state = initialState, action: CampaignActions): CampaignState {
  switch (action.type) {
    case CampaignActionTypes.CAMPAIGN_NEW: {
      return initialState;
    }
    case CampaignActionTypes.CAMPAIGN_FORM_UPDATE: {
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
    case CampaignActionTypes.CAMPAIGN_LOAD: {
      return {
        ...state,
        loading: true
      };
    }
    case CampaignActionTypes.CAMPAIGN_FORM_SAVE: {
      return {
        ...state,
        saving: true
      };
    }
    case CampaignActionTypes.CAMPAIGN_LOAD_SUCCESS:
    case CampaignActionTypes.CAMPAIGN_FORM_SAVE_SUCCESS: {
      const { campaign, doc } = action.payload;
      return {
        ...state,
        doc,
        localCampaign: campaign,
        remoteCampaign: campaign,
        changed: false,
        valid: true,
        saving: false,
        loading: false
      };
    }
    case CampaignActionTypes.CAMPAIGN_LOAD_FAILURE: {
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    }
    case CampaignActionTypes.CAMPAIGN_FORM_SAVE_FAILURE: {
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
