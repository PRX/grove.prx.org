import { HalDoc } from 'ngx-prx-styleguide';
import { Advertiser, docToAdvertiser } from './advertiser.models';
import { filterUnderscores } from './haldoc.utils';

export interface Creative {
  id?: number | string;
  url?: string;
  filename?: string;
  set_account_uri?: string;
  set_advertiser_uri?: string;
  advertiser?: Advertiser;
  pingbacks?: string[];
  fileSize?: number;
  mimeType?: string;
  createdAt?: Date;
}

export interface CreativeState {
  doc?: HalDoc;
  creative: Creative;
  page?: number;
  changed?: boolean;
  valid?: boolean;
}

export interface CreativeParams {
  page?: number;
  per?: number;
  // advertiser filter not supported yet
  // advertiser?: number;
  // filename contains `text`
  text?: string;
  sort?: string;
  direction?: string;
}

export const getCreativeId = (state?: CreativeState): string => {
  return (state && state.creative && state.creative.id && state.creative.id.toString()) || 'new';
};

export const docToCreative = (creativeDoc: HalDoc, advertiserDoc?: HalDoc): Creative => {
  const creative = filterUnderscores(creativeDoc) as Creative;
  return {
    ...creative,
    createdAt: new Date(creative.createdAt),
    set_account_uri: creativeDoc.expand('prx:account'),
    set_advertiser_uri: creativeDoc.expand('prx:advertiser'),
    ...(advertiserDoc && { advertiser: docToAdvertiser(advertiserDoc) })
  };
};
