import { createReducer, on } from '@ngrx/store';
import * as advertiserActions from '../actions/advertiser-action.creator';
import * as campaignActions from '../actions/campaign-action.creator';
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

export const reducer = createReducer(
  initialState,
  on(campaignActions.CampaignNew, campaignActions.CampaignDeleteSuccess, (state, action) => ({
    ...initialState,
    loading: false,
    loaded: true
  })),
  on(campaignActions.CampaignDupFromForm, (state, action) => ({
    localCampaign: duplicateCampaign(action.campaign),
    changed: true,
    valid: true,
    loading: false,
    loaded: true,
    saving: false
  })),
  on(campaignActions.CampaignDupByIdSuccess, (state, action) => ({
    localCampaign: duplicateCampaign(docToCampaign(action.campaignDoc)),
    changed: true,
    valid: true,
    loading: false,
    loaded: true,
    saving: false
  })),
  on(campaignActions.CampaignFormUpdate, (state, action) => {
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
  }),
  on(advertiserActions.AddAdvertiserSuccess, (state, action) => {
    const { set_advertiser_uri } = docToAdvertiser(action.doc);
    return {
      ...state,
      localCampaign: {
        ...state.localCampaign,
        set_advertiser_uri
      },
      changed: true
    };
  }),
  on(advertiserActions.AdvertisersLoad, campaignActions.CampaignLoad, (state, action) => ({
    ...state,
    loading: true,
    loaded: false
  })),
  on(campaignActions.CampaignSave, (state, action) => ({
    ...state,
    saving: true
  })),
  on(campaignActions.CampaignLoadSuccess, campaignActions.CampaignSaveSuccess, (state, action) => {
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
  }),
  on(campaignActions.CampaignDupByIdFailure, campaignActions.CampaignLoadFailure, (state, action) => ({
    ...initialState,
    loading: false,
    loaded: true,
    error: action.error
  })),
  on(campaignActions.CampaignSaveFailure, (state, action) => ({
    ...state,
    saving: false,
    error: action.error
  })),
  on(campaignActions.CampaignDeleteFailure, (state, action) => ({
    ...state,
    error: action.error
  }))
);
