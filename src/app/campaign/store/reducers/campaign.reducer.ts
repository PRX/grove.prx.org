import { CampaignActions } from '../actions/';
import { CampaignActionTypes } from '../actions/campaign.action.types';

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
  localCampaign: Campaign;
  remoteCampaign?: Campaign;
  changed: boolean;
  valid: boolean;
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
  valid: false
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
    case CampaignActionTypes.CAMPAIGN_LOAD_SUCCESS: {
      const { campaign } = action.payload;
      return {
        ...state,
        localCampaign: campaign,
        remoteCampaign: campaign,
        changed: false,
        valid: true
      };
    }
    default:
      return state;
  }
}
